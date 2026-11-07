from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, HTTPException, Request
from sqlalchemy import or_, select
from sqlalchemy.orm import Session as DbSession

from app.config import get_settings
from app.db.base import get_db
from app.db.models import Organization, Session, User
from app.security import session_token_hash


@dataclass(frozen=True)
class Identity:
    user: User
    session: Session

    @property
    def active_organization_id(self) -> str | None:
        return self.session.active_organization_id


Db = Annotated[DbSession, Depends(get_db)]


def require_identity(request: Request, db: Db) -> Identity:
    settings = get_settings()
    token = request.cookies.get(settings.session_cookie_name)
    if not token:
        raise HTTPException(status_code=401, detail="A verified account is required.")
    hashed_token = session_token_hash(token)
    session = db.scalar(
        select(Session).where(
            or_(Session.token == hashed_token, Session.token == token),
            Session.expires_at > datetime.now(UTC),
        )
    )
    user = db.get(User, session.user_id) if session else None
    if not session or not user or not user.email_verified:
        raise HTTPException(status_code=401, detail="A verified account is required.")
    if session.token == token:
        session.token = hashed_token
        db.commit()
    return Identity(user=user, session=session)


def require_membership(
    db: DbSession,
    identity: Identity,
    organization_id: str,
    permission: str | None = None,
):
    from app.permissions import has_permission

    if identity.active_organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Organization not found.")
    from app.db.models import Membership

    result = db.execute(
        select(Membership, Organization)
        .join(Organization, Organization.id == Membership.organization_id)
        .where(
            Membership.organization_id == organization_id,
            Membership.user_id == identity.user.id,
        )
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="Organization not found.")
    member, organization = result
    if permission and not has_permission(member.role, permission):
        raise HTTPException(
            status_code=403, detail="Your organization role does not allow this action."
        )
    return member, organization


def require_trusted_origin(request: Request) -> None:
    if request.headers.get("origin") != get_settings().web_origin:
        raise HTTPException(status_code=403, detail="A trusted browser origin is required.")
