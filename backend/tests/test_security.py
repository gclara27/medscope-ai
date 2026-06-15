"""core.security bcrypt utilities (T-120)."""

from core.security import hash_password, verify_password


def test_hash_and_verify_password() -> None:
    hashed = hash_password("MedScope123!")
    assert verify_password("MedScope123!", hashed) is True
    assert verify_password("wrong-password", hashed) is False
