from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode, urlsplit, urlunsplit

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.audit import record_audit
from app.config import get_settings
from app.db.base import get_db
from app.db.models import Account, AuditAction, User, Verification
from app.db.models import Session as UserSession
from app.dependencies import Identity, require_identity, require_trusted_origin
from app.limits import enforce_rate_limit
from app.schemas import (
    EmailRequest,
    PasswordResetRequest,
    ResetPasswordRequest,
    SignInRequest,
    SignUpRequest,
    UpdateUserRequest,
)
from app.security import (
    hash_password,
    new_id,
    new_token,
    session_token_hash,
    token_hash,
    verify_password,
)
from worker.tasks.email import send_email

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
SESSION_LIFETIME = timedelta(days=7)
VERIFICATION_LIFETIME = timedelta(days=1)
RESET_LIFETIME = timedelta(hours=1)


@router.post("/sign-up/email")
def sign_up(body: SignUpRequest, request: Request, db: Session = Depends(get_db)):
    require_trusted_origin(request)
    enforce_rate_limit(request, "sign-up", 5)
    email = str(body.email).lower()
    if db.scalar(select(User.id).where(User.email == email)):
        return {"status": "verification_sent"}
    user = User(id=new_id(), name=body.name.strip(), email=email, email_verified=False)
    db.add(user)
    db.flush()
    db.add(
        Account(
            id=new_id(),
            account_id=user.id,
            provider_id="credential",
            user_id=user.id,
            password=hash_password(body.password),
        )
    )
    record_audit(
        db,
        action=AuditAction.USER_REGISTERED,
        actor_user_id=user.id,
        target_type="user",
        target_id=user.id,
    )
    token = _store_verification(db, f"verify:{email}", VERIFICATION_LIFETIME)
    db.commit()
    callback = _safe_callback(body.callback_url or f"{get_settings().web_origin}/auth/verify-email")
    _queue_email(
        to=email,
        subject="Verify your Salesmora email",
        text=(
            "Verify your email address to finish setting up Salesmora:\n\n"
            f"{_verification_url(token, callback)}\n\n"
            "If you did not create an account, ignore this message."
        ),
    )
    return {"status": "verification_sent"}


@router.post("/sign-in/email")
def sign_in(
    body: SignInRequest, request: Request, response: Response, db: Session = Depends(get_db)
):
    require_trusted_origin(request)
    enforce_rate_limit(request, "sign-in", 5)
    email = str(body.email).lower()
    user = db.scalar(select(User).where(User.email == email))
    account = db.scalar(
        select(Account).where(
            Account.user_id == user.id if user else False,
            Account.provider_id == "credential",
        )
    )
    if not user or not account or not verify_password(body.password, account.password):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="Verify your email address before signing in.")
    _, raw_token = _create_session(user, request, db)
    _set_session_cookie(response, raw_token)
    return {"user": {"id": user.id, "name": user.name, "email": user.email}}


@router.post("/sign-out")
def sign_out(
    request: Request,
    response: Response,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    record_audit(db, action=AuditAction.SESSION_REVOKED, actor_user_id=identity.user.id)
    db.delete(identity.session)
    db.commit()
    _clear_session_cookie(response)
    return {"success": True}


@router.get("/get-session")
def get_session(identity: Identity = Depends(require_identity)):
    return {
        "user": {
            "id": identity.user.id,
            "name": identity.user.name,
            "email": identity.user.email,
            "emailVerified": True,
        },
        "session": {
            "id": identity.session.id,
            "expiresAt": identity.session.expires_at.isoformat(),
            "activeOrganizationId": identity.session.active_organization_id,
        },
    }


@router.post("/update-user")
def update_user(
    body: UpdateUserRequest,
    request: Request,
    identity: Identity = Depends(require_identity),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)
    identity.user.name = body.name.strip()
    db.commit()
    return {
        "user": {"id": identity.user.id, "name": identity.user.name, "email": identity.user.email}
    }


@router.post("/forget-password")
def forget_password(body: PasswordResetRequest, request: Request, db: Session = Depends(get_db)):
    require_trusted_origin(request)
    enforce_rate_limit(request, "password-reset", 5)
    email = str(body.email).lower()
    user = db.scalar(select(User).where(User.email == email))
    if user and user.email_verified:
        token = _store_verification(db, f"reset:{email}", RESET_LIFETIME)
        db.commit()
        callback = _safe_callback(
            body.redirect_to or f"{get_settings().web_origin}/auth/reset-password"
        )
        reset_url = f"{callback}{'&' if '?' in callback else '?'}{urlencode({'token': token})}"
        _queue_email(
            to=email,
            subject="Reset your Salesmora password",
            text=(
                "Use this link to reset your Salesmora password:\n\n"
                f"{reset_url}\n\n"
                "If you did not request a reset, ignore this message."
            ),
        )
    return {"status": "reset_link_sent"}


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    require_trusted_origin(request)
    enforce_rate_limit(request, "password-reset-submit", 5)
    verification = _find_verification(db, "reset", body.token)
    if not verification:
        raise HTTPException(status_code=400, detail="This reset link is invalid or expired.")
    email = verification.identifier.removeprefix("reset:")
    user = db.scalar(select(User).where(User.email == email))
    account = (
        db.scalar(
            select(Account).where(Account.user_id == user.id, Account.provider_id == "credential")
        )
        if user
        else None
    )
    if not user or not account:
        raise HTTPException(status_code=400, detail="This reset link is invalid or expired.")
    account.password = hash_password(body.new_password)
    db.execute(delete(UserSession).where(UserSession.user_id == user.id))
    db.delete(verification)
    db.commit()
    return {"status": "password_updated"}


@router.post("/send-verification-email")
def resend_verification(body: EmailRequest, request: Request, db: Session = Depends(get_db)):
    require_trusted_origin(request)
    enforce_rate_limit(request, "email-verification", 5)
    email = str(body.email).lower()
    user = db.scalar(select(User).where(User.email == email, User.email_verified.is_(False)))
    if user:
        token = _store_verification(db, f"verify:{email}", VERIFICATION_LIFETIME)
        db.commit()
        callback = _safe_callback(
            body.callback_url or f"{get_settings().web_origin}/auth/verify-email"
        )
        _queue_email(
            to=email,
            subject="Verify your Salesmora email",
            text=(
                "Verify your email address to finish setting up Salesmora:\n\n"
                f"{_verification_url(token, callback)}\n\n"
                "If you did not create an account, ignore this message."
            ),
        )
    return {"status": "verification_sent"}


@router.get("/verify-email")
def verify_email(token: str, callbackURL: str | None = None, db: Session = Depends(get_db)):
    verification = _find_verification(db, "verify", token)
    if not verification:
        raise HTTPException(status_code=400, detail="This verification link is invalid or expired.")
    email = verification.identifier.removeprefix("verify:")
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(status_code=400, detail="This verification link is invalid or expired.")
    user.email_verified = True
    db.delete(verification)
    _, raw_token = _create_session(user, None, db)
    record_audit(db, action=AuditAction.SESSION_CREATED, actor_user_id=user.id)
    db.commit()
    redirect = RedirectResponse(
        _safe_callback(callbackURL or f"{get_settings().web_origin}/auth/verify-email"),
        status_code=302,
    )
    _set_session_cookie(redirect, raw_token)
    return redirect


def _create_session(user: User, request: Request | None, db: Session) -> tuple[UserSession, str]:
    raw_token = new_token()
    session = UserSession(
        id=new_id(),
        user_id=user.id,
        token=session_token_hash(raw_token),
        expires_at=datetime.now(UTC) + SESSION_LIFETIME,
        ip_address=request.client.host if request and request.client else None,
        user_agent=request.headers.get("user-agent")[:255]
        if request and request.headers.get("user-agent")
        else None,
    )
    db.add(session)
    record_audit(db, action=AuditAction.SESSION_CREATED, actor_user_id=user.id)
    db.commit()
    return session, raw_token


def _set_session_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        settings.session_cookie_name,
        token,
        max_age=int(SESSION_LIFETIME.total_seconds()),
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        get_settings().session_cookie_name, path="/", httponly=True, samesite="lax"
    )


def _store_verification(db: Session, identifier: str, lifetime: timedelta) -> str:
    db.execute(delete(Verification).where(Verification.identifier == identifier))
    token = new_token()
    db.add(
        Verification(
            id=new_id(),
            identifier=identifier,
            value=token_hash(token),
            expires_at=datetime.now(UTC) + lifetime,
        )
    )
    db.flush()
    return token


def _find_verification(db: Session, kind: str, token: str) -> Verification | None:
    if len(token) < 32 or len(token) > 128:
        return None
    candidate = token_hash(token)
    verification = db.scalar(
        select(Verification).where(
            Verification.identifier.like(f"{kind}:%"),
            Verification.value == candidate,
            Verification.expires_at > datetime.now(UTC),
        )
    )
    return verification


def _verification_url(token: str, callback: str) -> str:
    base = f"{get_settings().api_origin}/api/v1/auth/verify-email"
    return f"{base}?{urlencode({'token': token, 'callbackURL': callback})}"


def _safe_callback(value: str) -> str:
    settings = get_settings()
    candidate = urlsplit(value)
    trusted = urlsplit(settings.web_origin)
    if candidate.scheme not in {"http", "https"} or candidate.netloc != trusted.netloc:
        return f"{settings.web_origin}/auth/verify-email"
    return urlunsplit(
        (candidate.scheme, candidate.netloc, candidate.path or "/", candidate.query, "")
    )


def _queue_email(to: str, subject: str, text: str) -> None:
    try:
        send_email.delay(to, subject, text)
    except Exception:
        # Account creation is preserved; the user can safely request another link.
        return
