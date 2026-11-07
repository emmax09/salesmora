import re
import unicodedata
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.audit import record_audit
from app.db.base import get_db
from app.db.models import (
    AuditAction,
    Membership,
    Organization,
    OrganizationCreationKey,
    OrganizationRole,
)
from app.dependencies import Identity, require_identity, require_membership, require_trusted_origin
from app.schemas import (
    ActivateOrganizationResponse,
    CreateOrganizationRequest,
    OrganizationListResponse,
    OrganizationSummary,
    UpdateOrganizationRequest,
)
from app.security import new_id

router = APIRouter(prefix="/api/v1/organizations", tags=["Organizations"])


@router.get("", response_model=OrganizationListResponse)
def list_organizations(
    identity: Identity = Depends(require_identity), db: Session = Depends(get_db)
):
    rows = db.execute(
        select(Membership, Organization)
        .join(Organization, Organization.id == Membership.organization_id)
        .where(Membership.user_id == identity.user.id)
        .order_by(Membership.created_at.asc())
    ).all()
    organizations = [
        _organization_summary(organization, member.role) for member, organization in rows
    ]
    active_id = identity.active_organization_id
    if active_id not in {item["id"] for item in organizations}:
        active_id = None
    return {"organizations": organizations, "activeOrganizationId": active_id}


@router.get("/current", response_model=OrganizationSummary)
def current_organization(
    identity: Identity = Depends(require_identity), db: Session = Depends(get_db)
):
    organization_id = identity.active_organization_id
    if not organization_id:
        raise HTTPException(status_code=404, detail="No active organization is selected.")
    member, organization = require_membership(db, identity, organization_id, "organization:read")
    return _organization_summary(organization, member.role)


@router.post("", response_model=OrganizationSummary)
def create_organization(
    body: CreateOrganizationRequest,
    request: Request,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    try:
        key = UUID(idempotency_key or "")
    except ValueError as error:
        raise HTTPException(
            status_code=400, detail="A valid idempotency key is required."
        ) from error
    existing = db.get(OrganizationCreationKey, key)
    if existing:
        return _recover_idempotent(db, identity, existing)
    organization = Organization(
        id=new_id(),
        name=body.name,
        slug=_slug(body.name),
        industry=body.industry,
        country=body.country.upper(),
        timezone=body.timezone,
        default_currency=body.default_currency.upper(),
    )
    db.add(organization)
    db.flush()
    member = Membership(
        id=new_id(),
        user_id=identity.user.id,
        organization_id=organization.id,
        role=OrganizationRole.OWNER,
    )
    db.add(member)
    db.add(
        OrganizationCreationKey(key=key, user_id=identity.user.id, organization_id=organization.id)
    )
    identity.session.active_organization_id = organization.id
    record_audit(
        db,
        action=AuditAction.ORGANIZATION_CREATED,
        actor_user_id=identity.user.id,
        organization_id=organization.id,
        target_type="organization",
        target_id=organization.id,
    )
    record_audit(
        db,
        action=AuditAction.MEMBERSHIP_CREATED,
        actor_user_id=identity.user.id,
        organization_id=organization.id,
        target_type="membership",
        target_id=identity.user.id,
        metadata={"role": OrganizationRole.OWNER.value},
    )
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        recovered = db.get(OrganizationCreationKey, key)
        if recovered:
            return _recover_idempotent(db, identity, recovered)
        raise HTTPException(
            status_code=409, detail="This organization request could not be completed."
        ) from error
    return _organization_summary(organization, member.role)


@router.patch("/{organization_id}", response_model=OrganizationSummary)
def update_organization(
    organization_id: str,
    body: UpdateOrganizationRequest,
    request: Request,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    changes = body.model_dump(exclude_unset=True)
    if not changes or any(value is None for value in changes.values()):
        raise HTTPException(status_code=422, detail="At least one valid field must be updated.")
    db.execute(select(Organization.id).where(Organization.id == organization_id).with_for_update())
    member, organization = require_membership(db, identity, organization_id, "organization:update")
    for field, value in changes.items():
        setattr(
            organization,
            field,
            value.upper() if field in {"country", "default_currency"} else value,
        )
    record_audit(
        db,
        action=AuditAction.ORGANIZATION_UPDATED,
        actor_user_id=identity.user.id,
        organization_id=organization_id,
        target_type="organization",
        target_id=organization_id,
        metadata={"fields": list(changes)},
    )
    db.commit()
    return _organization_summary(organization, member.role)


@router.post("/{organization_id}/activate", response_model=ActivateOrganizationResponse)
def activate_organization(
    organization_id: str,
    request: Request,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    db.execute(select(Organization.id).where(Organization.id == organization_id).with_for_update())
    require_membership(db, identity, organization_id)
    identity.session.active_organization_id = organization_id
    record_audit(
        db,
        action=AuditAction.ACTIVE_ORGANIZATION_CHANGED,
        actor_user_id=identity.user.id,
        organization_id=organization_id,
        target_type="organization",
        target_id=organization_id,
    )
    db.commit()
    return {"activeOrganizationId": organization_id}


def _recover_idempotent(db: Session, identity: Identity, key_record: OrganizationCreationKey):
    if key_record.user_id != identity.user.id:
        raise HTTPException(
            status_code=409, detail="This organization request key has already been used."
        )
    rows = db.execute(
        select(Membership, Organization)
        .join(Organization, Organization.id == Membership.organization_id)
        .where(
            Membership.organization_id == key_record.organization_id,
            Membership.user_id == identity.user.id,
        )
    ).first()
    if not rows:
        raise HTTPException(
            status_code=409, detail="The organization request is no longer available."
        )
    member, organization = rows
    identity.session.active_organization_id = organization.id
    db.commit()
    return _organization_summary(organization, member.role)


def _organization_summary(organization: Organization, role: OrganizationRole) -> dict:
    return {
        "id": organization.id,
        "name": organization.name,
        "slug": organization.slug,
        "industry": organization.industry,
        "country": organization.country,
        "timezone": organization.timezone,
        "defaultCurrency": organization.default_currency,
        "role": role.value,
    }


def _slug(name: str) -> str:
    base = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")[:80]
    return f"{base or 'workspace'}-{new_id()[:8].lower()}"
