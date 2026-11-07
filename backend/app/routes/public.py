from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.db.models import ContactMessage, EarlyAccessLead
from app.limits import enforce_rate_limit
from app.schemas import ContactRequest, EarlyAccessRequest, PublicSubmissionResponse
from app.security import new_id

router = APIRouter(prefix="/api/v1/public", tags=["Public forms"])


@router.post("/early-access", response_model=PublicSubmissionResponse)
def submit_early_access(body: EarlyAccessRequest, request: Request, db: Session = Depends(get_db)):
    enforce_rate_limit(request, "early-access", 4)
    if body.website:
        return {"status": "received"}
    lead = EarlyAccessLead(
        id=new_id(),
        name=body.name.strip(),
        email=str(body.email).lower(),
        organization=body.organization,
        interest=body.interest,
        consent_at=datetime.now(UTC),
        consent_version="early-access-v1",
    )
    db.add(lead)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        if getattr(
            error.orig, "sqlstate", None
        ) != "23505" and "UNIQUE constraint failed" not in str(error.orig):
            raise
    return {"status": "received"}


@router.post("/contact", response_model=PublicSubmissionResponse)
def submit_contact(body: ContactRequest, request: Request, db: Session = Depends(get_db)):
    enforce_rate_limit(request, "contact", 4)
    if body.website:
        return {"status": "received"}
    db.add(
        ContactMessage(
            id=new_id(),
            name=body.name.strip(),
            email=str(body.email).lower(),
            subject=body.subject.strip(),
            message=body.message.strip(),
        )
    )
    db.commit()
    return {"status": "received"}
