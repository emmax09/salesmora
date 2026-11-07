from fastapi import APIRouter, Depends

from app.dependencies import Identity, require_identity
from app.schemas import CurrentIdentityResponse

router = APIRouter(prefix="/api/v1", tags=["Identity"])


@router.get("/identity/me", response_model=CurrentIdentityResponse)
def current_identity(identity: Identity = Depends(require_identity)):
    return {
        "user": {
            "id": identity.user.id,
            "name": identity.user.name,
            "email": identity.user.email,
        },
        "emailVerified": True,
        "sessionExpiresAt": identity.session.expires_at.isoformat(),
        "activeOrganizationId": identity.session.active_organization_id,
    }
