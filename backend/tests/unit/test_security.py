from app.core.security import (
    hash_password,
    verify_password
)

def test_verify_password():
    password = "Admin123!"
    hashed = hash_password(password)

    assert verify_password(password, hashed)