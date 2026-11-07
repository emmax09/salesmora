from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.audit import record_audit
from app.db.base import get_db
from app.db.models import (
    AuditAction,
    Membership,
    Organization,
    OrganizationRole,
    User,
)
from app.db.models import (
    Session as UserSession,
)
from app.dependencies import Identity, require_identity, require_membership, require_trusted_origin
from app.permissions import can_assign_role, can_manage_member
from app.schemas import (
    MemberListResponse,
    MemberSummary,
    SuccessResponse,
    TransferOwnershipRequest,
    TransferOwnershipResponse,
    UpdateMemberRoleRequest,
)

router = APIRouter(prefix="/api/v1/organizations/{organization_id}/members", tags=["Members"])


@router.get("", response_model=MemberListResponse)
def list_members(
    organization_id: str,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_membership(db, identity, organization_id, "members:read")
    rows = db.execute(
        select(Membership, User)
        .join(User, User.id == Membership.user_id)
        .where(Membership.organization_id == organization_id)
        .order_by(Membership.created_at.asc())
    ).all()
    return {"members": [_member_summary(member, user) for member, user in rows]}


@router.patch("/{member_id}/role", response_model=MemberSummary)
def change_role(
    organization_id: str,
    member_id: str,
    body: UpdateMemberRoleRequest,
    request: Request,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    _lock_organization(db, organization_id)
    actor, _ = require_membership(db, identity, organization_id, "members:manage")
    target = db.get(Membership, member_id)
    if not target or target.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Organization member not found.")
    if not can_assign_role(actor.role, body.role) or not can_manage_member(actor.role, target.role):
        raise HTTPException(status_code=403, detail="You cannot change this member role.")
    previous_role = target.role
    if previous_role == body.role:
        user = db.get(User, target.user_id)
        return _member_summary(target, user)
    if previous_role == OrganizationRole.OWNER and _owner_count(db, organization_id) <= 1:
        raise HTTPException(
            status_code=409, detail="The organization must keep at least one owner."
        )
    target.role = OrganizationRole(body.role)
    record_audit(
        db,
        action=AuditAction.MEMBERSHIP_ROLE_CHANGED,
        actor_user_id=identity.user.id,
        organization_id=organization_id,
        target_type="membership",
        target_id=member_id,
        metadata={"previousRole": previous_role.value, "role": target.role.value},
    )
    db.commit()
    return _member_summary(target, db.get(User, target.user_id))


@router.delete("/{member_id}", response_model=SuccessResponse)
def remove_member(
    organization_id: str,
    member_id: str,
    request: Request,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    _lock_organization(db, organization_id)
    actor, _ = require_membership(db, identity, organization_id, "members:manage")
    target = db.get(Membership, member_id)
    if not target or target.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Organization member not found.")
    if not can_manage_member(actor.role, target.role):
        raise HTTPException(status_code=403, detail="You cannot remove this organization member.")
    if target.role == OrganizationRole.OWNER and _owner_count(db, organization_id) <= 1:
        raise HTTPException(
            status_code=409, detail="The last active organization owner cannot be removed."
        )
    role = target.role
    target_user_id = target.user_id
    db.delete(target)
    db.execute(
        update(UserSession)
        .where(
            UserSession.user_id == target_user_id,
            UserSession.active_organization_id == organization_id,
        )
        .values(active_organization_id=None)
    )
    record_audit(
        db,
        action=AuditAction.MEMBERSHIP_REMOVED,
        actor_user_id=identity.user.id,
        organization_id=organization_id,
        target_type="membership",
        target_id=member_id,
        metadata={"role": role.value},
    )
    db.commit()
    return {"success": True}


@router.post("/ownership-transfer", response_model=TransferOwnershipResponse)
def transfer_ownership(
    organization_id: str,
    body: TransferOwnershipRequest,
    request: Request,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    _lock_organization(db, organization_id)
    actor, _ = require_membership(db, identity, organization_id, "ownership:transfer")
    if actor.role != OrganizationRole.OWNER:
        raise HTTPException(status_code=403, detail="Only an owner can transfer ownership.")
    if body.user_id == identity.user.id:
        raise HTTPException(status_code=409, detail="Choose another organization member.")
    target = db.scalar(
        select(Membership).where(
            Membership.organization_id == organization_id,
            Membership.user_id == body.user_id,
        )
    )
    if not target:
        raise HTTPException(status_code=404, detail="Organization member not found.")
    if target.role == OrganizationRole.OWNER:
        raise HTTPException(status_code=409, detail="This member already owns the organization.")
    target.role = OrganizationRole.OWNER
    actor.role = OrganizationRole.ADMIN
    record_audit(
        db,
        action=AuditAction.OWNERSHIP_TRANSFERRED,
        actor_user_id=identity.user.id,
        organization_id=organization_id,
        target_type="membership",
        target_id=target.id,
        metadata={"previousOwnerId": identity.user.id, "newOwnerId": body.user_id},
    )
    db.commit()
    return {"ownerUserId": body.user_id}


def _lock_organization(db: Session, organization_id: str) -> None:
    found = db.scalar(
        select(Organization.id).where(Organization.id == organization_id).with_for_update()
    )
    if not found:
        raise HTTPException(status_code=404, detail="Organization not found.")


def _owner_count(db: Session, organization_id: str) -> int:
    return (
        db.scalar(
            select(func.count())
            .select_from(Membership)
            .where(
                Membership.organization_id == organization_id,
                Membership.role == OrganizationRole.OWNER,
            )
        )
        or 0
    )


def _member_summary(member: Membership, user: User | None) -> dict:
    if not user:
        raise HTTPException(status_code=404, detail="Organization member not found.")
    return {
        "id": member.id,
        "userId": user.id,
        "name": user.name,
        "email": user.email,
        "role": member.role.value,
        "createdAt": member.created_at.isoformat(),
    }
