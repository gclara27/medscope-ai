"""seed demo users

Revision ID: 1152e8c4f00f
Revises: 018b4f1e8a06
Create Date: 2026-06-11 16:05:12.123456

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import delete

from seeds.users import USER_EMAILS, build_user_seed_rows

# revision identifiers, used by Alembic.
revision: str = "1152e8c4f00f"
down_revision: Union[str, Sequence[str], None] = "018b4f1e8a06"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

users_table = sa.table(
    "users",
    sa.column("id", sa.Uuid()),
    sa.column("role_id", sa.Uuid()),
    sa.column("first_name", sa.String()),
    sa.column("last_name", sa.String()),
    sa.column("email", sa.String()),
    sa.column("password_hash", sa.Text()),
    sa.column("is_active", sa.Boolean()),
)


def upgrade() -> None:
    """Insert demo users with bcrypt password hashes (Database.md §10)."""
    op.bulk_insert(users_table, build_user_seed_rows())


def downgrade() -> None:
    """Remove demo users."""
    op.execute(delete(users_table).where(users_table.c.email.in_(USER_EMAILS)))
