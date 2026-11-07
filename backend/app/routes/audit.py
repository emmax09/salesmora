from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.db.models import AuditEvent, User
from app.dependencies import Identity, require_identity, require_membership
from app.schemas import AuditEventListResponse

router = APIRouter(prefix="/api/v1/organizations/{organization_id}/audit-events", tags=["Audit"])


@router.get("", response_model=AuditEventListResponse)
def list_audit_events(
    organization_id: str,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_membership(db, identity, organization_id, "audit:read")
    rows = db.execute(
        select(AuditEvent, User.name)
        .outerjoin(User, User.id == AuditEvent.actor_user_id)
        .where(AuditEvent.organization_id == organization_id)
        .order_by(AuditEvent.created_at.desc())
        .limit(100)
    ).all()
    return {
        "auditEvents": [
            {
                "id": event.id,
                "action": event.action.value,
                "actorUserId": event.actor_user_id,
                "actorName": actor_name,
                "targetType": event.target_type,
                "targetId": event.target_id,
                "metadata": event.metadata_json,
                "createdAt": event.created_at.isoformat(),
            }
            for event, actor_name in rows
        ]
    }
