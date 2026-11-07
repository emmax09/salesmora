import base64
import hashlib
import hmac
import secrets
from uuid import uuid4

from app.config import get_settings

SCRYPT_COST = 2**14
SCRYPT_BLOCK_SIZE = 8
SCRYPT_PARALLELIZATION = 5
SCRYPT_KEY_LENGTH = 64


def new_id() -> str:
    return secrets.token_urlsafe(18)


def new_token() -> str:
    return secrets.token_urlsafe(32)


def new_uuid():
    return uuid4()


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def session_token_hash(token: str) -> str:
    secret = get_settings().app_secret_key.encode("utf-8")
    return hmac.new(secret, token.encode("utf-8"), hashlib.sha256).hexdigest()


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    key = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=SCRYPT_COST,
        r=SCRYPT_BLOCK_SIZE,
        p=SCRYPT_PARALLELIZATION,
        dklen=SCRYPT_KEY_LENGTH,
        maxmem=64 * 1024 * 1024,
    )
    salt_value = base64.urlsafe_b64encode(salt).decode("ascii").rstrip("=")
    key_value = base64.urlsafe_b64encode(key).decode("ascii").rstrip("=")
    return (
        f"scrypt${SCRYPT_COST}${SCRYPT_BLOCK_SIZE}"
        f"${SCRYPT_PARALLELIZATION}${salt_value}${key_value}"
    )


def verify_password(password: str, encoded: str | None) -> bool:
    if not encoded:
        return False
    try:
        algorithm, cost, block, parallel, salt_text, expected_text = encoded.split("$")
        if (algorithm, int(cost), int(block), int(parallel)) != (
            "scrypt",
            SCRYPT_COST,
            SCRYPT_BLOCK_SIZE,
            SCRYPT_PARALLELIZATION,
        ):
            return False
        salt = base64.urlsafe_b64decode(salt_text + "=" * (-len(salt_text) % 4))
        expected = base64.urlsafe_b64decode(expected_text + "=" * (-len(expected_text) % 4))
        if len(salt) != 16 or len(expected) != SCRYPT_KEY_LENGTH:
            return False
        actual = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt,
            n=SCRYPT_COST,
            r=SCRYPT_BLOCK_SIZE,
            p=SCRYPT_PARALLELIZATION,
            dklen=SCRYPT_KEY_LENGTH,
            maxmem=64 * 1024 * 1024,
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError, MemoryError):
        return False
