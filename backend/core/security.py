"""Password hashing utilities — RNF-030."""

import bcrypt


def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash for storage."""
    return bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Check a plain password against a stored bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode(), password_hash.encode())
