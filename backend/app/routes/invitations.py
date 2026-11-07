from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

from celery.result import AsyncResult
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.audit import record_audit
from app.config import get_settings
from app.db.base import get_db
from app.db.models import (
    AuditAction,
    Invitation,
    InvitationDeliveryStatus,
    InvitationStatus,
    Membership,
    Organization,
    OrganizationRole,
    User,
)
from app.dependencies import Identity, require_identity, require_membership, require_trusted_origin
from app.permissions import can_assign_role
from app.schemas import (
    AcceptInvitationRequest,
    AcceptInvitationResponse,
    InvitationListResponse,
    InvitationSummary,
    InviteMemberRequest,
    SuccessResponse,
)
from app.security import new_id, new_token, token_hash
from worker.tasks.email import send_email

router = APIRouter(tags=["Invitations"])
INVITATION_LIFETIME = timedelta(days=7)


@router.get(
    "/api/v1/organizations/{organization_id}/invitations", response_model=InvitationListResponse
)
def list_invitations(
    organization_id: str,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_membership(db, identity, organization_id, "invitations:read")
    now = datetime.now(UTC)
    db.execute(
        update(Invitation)
        .where(
            Invitation.organization_id == organization_id,
            Invitation.status == InvitationStatus.PENDING,
            Invitation.expires_at <= now,
        )
        .values(status=InvitationStatus.EXPIRED)
    )
    db.commit()
    rows = db.execute(
        select(Invitation, User)
        .join(User, User.id == Invitation.invited_by_id)
        .where(
            Invitation.organization_id == organization_id,
            Invitation.status.in_([InvitationStatus.PENDING, InvitationStatus.EXPIRED]),
        )
        .order_by(Invitation.created_at.desc())
    ).all()
    return {
        "invitations": [_invitation_summary(invitation, inviter) for invitation, inviter in rows]
    }


@router.post(
    "/api/v1/organizations/{organization_id}/invitations", response_model=InvitationSummary
)
def invite_member(
    organization_id: str,
    body: InviteMemberRequest,
    request: Request,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    organization = _lock_organization(db, organization_id)
    actor, _ = require_membership(db, identity, organization_id, "members:invite")
    role = OrganizationRole(body.role)
    if not can_assign_role(actor.role, role):
        raise HTTPException(
            status_code=403, detail="Your organization role cannot invite this role."
        )
    email = str(body.email).lower()
    existing_user = db.scalar(select(User).where(User.email == email))
    if existing_user and db.scalar(
        select(Membership.id).where(
            Membership.organization_id == organization_id,
            Membership.user_id == existing_user.id,
        )
    ):
        raise HTTPException(
            status_code=409, detail="This person is already a member of the organization."
        )
    now = datetime.now(UTC)
    _expire_old(db, organization_id, now)
    open_invite = db.scalar(
        select(Invitation.id).where(
            Invitation.organization_id == organization_id,
            Invitation.email == email,
            Invitation.status == InvitationStatus.PENDING,
            Invitation.expires_at > now,
        )
    )
    if open_invite:
        raise HTTPException(
            status_code=409, detail="An active invitation already exists for this email address."
        )
    token = new_token()
    invitation = Invitation(
        id=new_id(),
        organization_id=organization_id,
        email=email,
        role=role,
        token_hash=token_hash(token),
        expires_at=now + INVITATION_LIFETIME,
        invited_by_id=identity.user.id,
    )
    db.add(invitation)
    record_audit(
        db,
        action=AuditAction.INVITATION_CREATED,
        actor_user_id=identity.user.id,
        organization_id=organization_id,
        target_type="invitation",
        target_id=invitation.id,
        metadata={"role": role.value},
    )
    db.commit()
    summary = _send_invitation(
        invitation, organization.name, identity.user.email, identity.user.name, token
    )
    return summary


@router.delete(
    "/api/v1/organizations/{organization_id}/invitations/{invitation_id}",
    response_model=SuccessResponse,
)
def revoke_invitation(
    organization_id: str,
    invitation_id: str,
    request: Request,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    _lock_organization(db, organization_id)
    require_membership(db, identity, organization_id, "invitations:revoke")
    now = datetime.now(UTC)
    invitation = db.scalar(
        select(Invitation).where(
            Invitation.id == invitation_id,
            Invitation.organization_id == organization_id,
            Invitation.status == InvitationStatus.PENDING,
            Invitation.expires_at > now,
        )
    )
    if not invitation:
        raise HTTPException(status_code=404, detail="Active invitation not found.")
    invitation.status = InvitationStatus.REVOKED
    invitation.revoked_at = now
    record_audit(
        db,
        action=AuditAction.INVITATION_REVOKED,
        actor_user_id=identity.user.id,
        organization_id=organization_id,
        target_type="invitation",
        target_id=invitation_id,
    )
    db.commit()
    return {"success": True}


@router.post(
    "/api/v1/organizations/{organization_id}/invitations/{invitation_id}/resend",
    response_model=InvitationSummary,
)
def resend_invitation(
    organization_id: str,
    invitation_id: str,
    request: Request,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    organization = _lock_organization(db, organization_id)
    actor, _ = require_membership(db, identity, organization_id, "members:invite")
    invitation = db.scalar(
        select(Invitation).where(
            Invitation.id == invitation_id,
            Invitation.organization_id == organization_id,
            Invitation.status.in_([InvitationStatus.PENDING, InvitationStatus.EXPIRED]),
        )
    )
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    if invitation.role == OrganizationRole.OWNER:
        raise HTTPException(
            status_code=409, detail="Ownership is transferred between existing members."
        )
    if not can_assign_role(actor.role, invitation.role):
        raise HTTPException(
            status_code=403, detail="Your organization role cannot resend this invitation."
        )
    now = datetime.now(UTC)
    duplicate = db.scalar(
        select(Invitation.id).where(
            Invitation.organization_id == organization_id,
            Invitation.email == invitation.email,
            Invitation.id != invitation_id,
            Invitation.status == InvitationStatus.PENDING,
            Invitation.expires_at > now,
        )
    )
    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Another active invitation already exists for this email address.",
        )
    token = new_token()
    invitation.status = InvitationStatus.PENDING
    invitation.token_hash = token_hash(token)
    invitation.expires_at = now + INVITATION_LIFETIME
    invitation.delivery_status = InvitationDeliveryStatus.FAILED
    invitation.accepted_at = None
    invitation.revoked_at = None
    record_audit(
        db,
        action=AuditAction.INVITATION_CREATED,
        actor_user_id=identity.user.id,
        organization_id=organization_id,
        target_type="invitation",
        target_id=invitation.id,
        metadata={"role": invitation.role.value, "resent": True},
    )
    db.commit()
    return _send_invitation(
        invitation, organization.name, identity.user.email, identity.user.name, token
    )


@router.post("/api/v1/invitations/accept", response_model=AcceptInvitationResponse)
def accept_invitation(
    body: AcceptInvitationRequest,
    request: Request,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    now = datetime.now(UTC)
    invitation = db.scalar(
        select(Invitation).where(Invitation.token_hash == token_hash(body.token))
    )
    if invitation:
        _lock_organization(db, invitation.organization_id)
        invitation = db.scalar(
            select(Invitation)
            .where(Invitation.id == invitation.id, Invitation.token_hash == token_hash(body.token))
            .with_for_update()
        )
    if (
        not invitation
        or invitation.status != InvitationStatus.PENDING
        or invitation.expires_at <= now
    ):
        raise HTTPException(status_code=404, detail="Invitation is invalid or no longer available.")
    if invitation.email != identity.user.email.lower():
        raise HTTPException(
            status_code=403, detail="Sign in with the email address that received this invitation."
        )
    if db.scalar(
        select(Membership.id).where(
            Membership.organization_id == invitation.organization_id,
            Membership.user_id == identity.user.id,
        )
    ):
        raise HTTPException(
            status_code=409, detail="You are already a member of this organization."
        )
    organization = db.get(Organization, invitation.organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Invitation is invalid or no longer available.")
    invitation.status = InvitationStatus.ACCEPTED
    invitation.accepted_at = now
    member = Membership(
        id=new_id(),
        organization_id=invitation.organization_id,
        user_id=identity.user.id,
        role=invitation.role,
    )
    db.add(member)
    identity.session.active_organization_id = invitation.organization_id
    record_audit(
        db,
        action=AuditAction.INVITATION_ACCEPTED,
        actor_user_id=identity.user.id,
        organization_id=invitation.organization_id,
        target_type="invitation",
        target_id=invitation.id,
        metadata={"role": invitation.role.value},
    )
    record_audit(
        db,
        action=AuditAction.MEMBERSHIP_CREATED,
        actor_user_id=identity.user.id,
        organization_id=invitation.organization_id,
        target_type="membership",
        target_id=member.id,
        metadata={"role": invitation.role.value},
    )
    db.commit()
    return {"organizationId": organization.id, "organizationName": organization.name}


def _send_invitation(
    invitation: Invitation,
    organization_name: str,
    inviter_email: str,
    inviter_name: str,
    token: str,
) -> dict:
    settings = get_settings()
    accept_url = f"{settings.web_origin}/auth/accept-invitation?{urlencode({'token': token})}"
    text = (
        f"{inviter_email} invited you to join {organization_name} on Salesmora.\n\n"
        f"Accept the invitation:\n{accept_url}\n\nThis link expires in seven days."
    )
    delivery = InvitationDeliveryStatus.FAILED
    try:
        result: AsyncResult = send_email.delay(
            invitation.email,
            f"Invitation to join {organization_name} on Salesmora",
            text,
            invitation.id,
        )
        if result.get(timeout=20) is True:
            delivery = InvitationDeliveryStatus.ACCEPTED_BY_SMTP
    except Exception:
        delivery = InvitationDeliveryStatus.FAILED
    return {
        "id": invitation.id,
        "email": invitation.email,
        "role": invitation.role.value,
        "status": invitation.status.value,
        "deliveryStatus": delivery.value,
        "expiresAt": invitation.expires_at.isoformat(),
        "createdAt": invitation.created_at.isoformat(),
        "invitedByName": inviter_name,
    }


def _invitation_summary(invitation: Invitation, inviter: User) -> dict:
    status = invitation.status
    if status == InvitationStatus.PENDING and invitation.expires_at <= datetime.now(UTC):
        status = InvitationStatus.EXPIRED
    return {
        "id": invitation.id,
        "email": invitation.email,
        "role": invitation.role.value,
        "status": status.value,
        "deliveryStatus": invitation.delivery_status.value,
        "expiresAt": invitation.expires_at.isoformat(),
        "createdAt": invitation.created_at.isoformat(),
        "invitedByName": inviter.name,
    }


def _expire_old(db: Session, organization_id: str, now: datetime) -> None:
    db.execute(
        update(Invitation)
        .where(
            Invitation.organization_id == organization_id,
            Invitation.status == InvitationStatus.PENDING,
            Invitation.expires_at <= now,
        )
        .values(status=InvitationStatus.EXPIRED)
    )


def _lock_organization(db: Session, organization_id: str) -> Organization:
    organization = db.scalar(
        select(Organization).where(Organization.id == organization_id).with_for_update()
    )
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return organization
