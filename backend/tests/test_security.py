from app.security import hash_password, session_token_hash, token_hash, verify_password


def test_scrypt_password_hash_round_trip():
    encoded = hash_password("Correct Horse Battery Staple 2026")

    assert encoded.startswith("scrypt$16384$8$5$")
    assert verify_password("Correct Horse Battery Staple 2026", encoded)
    assert not verify_password("wrong password", encoded)


def test_password_verifier_rejects_malformed_hash():
    assert not verify_password("password", "scrypt$1$1$1$bad$bad")
    assert not verify_password("password", None)


def test_session_tokens_are_keyed_and_invitation_tokens_are_hashed():
    token = "test-session-token"
    assert len(session_token_hash(token)) == 64
    assert session_token_hash(token) != token
    assert len(token_hash(token)) == 64
