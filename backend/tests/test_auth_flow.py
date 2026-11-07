from urllib.parse import urlsplit

from sqlalchemy import select

from app.db.models import Session, User
from app.routes import auth as auth_routes


def test_signup_verification_session_and_signout(api_client, monkeypatch):
    client, test_sessions = api_client
    queued_emails = []

    def queue_email(*args):
        queued_emails.append(args)

    monkeypatch.setattr(auth_routes, "enforce_rate_limit", lambda *_args: None)
    monkeypatch.setattr(auth_routes.send_email, "delay", queue_email)
    headers = {"Origin": "http://localhost:3000"}
    payload = {
        "name": "Test Account",
        "email": "test@example.com",
        "password": "Long enough password 2026",
        "callbackURL": "http://localhost:3000/auth/verify-email?returnTo=%2Fonboarding",
    }

    registered = client.post("/api/v1/auth/sign-up/email", json=payload, headers=headers)
    assert registered.status_code == 200, registered.text
    assert registered.json() == {"status": "verification_sent"}
    assert len(queued_emails) == 1

    verify_url = next(part for part in queued_emails[0][2].split() if "verify-email?" in part)
    location = urlsplit(verify_url)
    verified = client.get(f"{location.path}?{location.query}", follow_redirects=False)
    assert verified.status_code == 302
    assert verified.headers["location"].startswith("http://localhost:3000/auth/verify-email")
    assert "salesmora_session" in client.cookies

    identity = client.get("/api/v1/identity/me")
    assert identity.status_code == 200
    assert identity.json()["user"]["email"] == "test@example.com"
    with test_sessions() as db:
        assert db.scalar(select(User).where(User.email == "test@example.com")).email_verified
        session = db.scalar(select(Session))
        assert session is not None
        assert session.token != client.cookies["salesmora_session"]
        session_id = session.id

    signed_out = client.post("/api/v1/auth/sign-out", headers=headers)
    assert signed_out.status_code == 200
    assert client.get("/api/v1/identity/me").status_code == 401
    with test_sessions() as db:
        assert db.get(Session, session_id) is None
