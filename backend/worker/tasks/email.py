import smtplib
from email.message import EmailMessage

from app.config import get_settings
from app.db.base import SessionLocal
from app.db.models import Invitation, InvitationDeliveryStatus
from worker.celery_app import celery_app


@celery_app.task(
    name="salesmora.send_email",
    autoretry_for=(OSError, smtplib.SMTPException),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_email(to: str, subject: str, text: str, invitation_id: str | None = None) -> bool:
    settings = get_settings()
    message = EmailMessage()
    message["From"] = settings.email_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content(text)
    try:
        if settings.smtp_secure:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
                _login_and_send(smtp, settings.smtp_username, settings.smtp_password, message)
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
                _login_and_send(smtp, settings.smtp_username, settings.smtp_password, message)
        if invitation_id:
            _set_invitation_delivery(invitation_id, InvitationDeliveryStatus.ACCEPTED_BY_SMTP)
        return True
    except (OSError, smtplib.SMTPException):
        raise


def _login_and_send(
    smtp, username: str | None, password: str | None, message: EmailMessage
) -> None:
    if username and password:
        smtp.login(username, password)
    smtp.send_message(message)


def _set_invitation_delivery(invitation_id: str, status: InvitationDeliveryStatus) -> None:
    with SessionLocal() as db:
        invitation = db.get(Invitation, invitation_id)
        if invitation:
            invitation.delivery_status = status
            db.commit()
