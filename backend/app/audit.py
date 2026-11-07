from typing import Any

from sqlalchemy.orm import Session

from app.db.models import AuditAction, AuditEvent
from app.security import new_id


def record_audit(
    db: Session,
    *,
    action: AuditAction,
    actor_user_id: str | None,
    organization_id: str | None = None,
    target_type: str | None = None,
    target_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    db.add(
        AuditEvent(
            id=new_id(),
            organization_id=organization_id,
            actor_user_id=actor_user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            metadata_json=metadata,
        )
    )
