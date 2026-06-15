"""seed roles

Revision ID: 018b4f1e8a06
Revises: 0a192feae12b
Create Date: 2026-06-11 15:56:58.077634

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import delete

from seeds.roles import ROLE_NAMES, SEED_ROLES

# revision identifiers, used by Alembic.
revision: str = "018b4f1e8a06"
down_revision: Union[str, Sequence[str], None] = "0a192feae12b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

roles_table = sa.table(
    "roles",
    sa.column("id", sa.Uuid()),
    sa.column("name", sa.String()),
    sa.column("description", sa.Text()),
)


def upgrade() -> None:
    """Insert MVP application roles (RF-004)."""
    op.bulk_insert(
        roles_table,
        [
            {
                "id": role["id"],
                "name": role["name"],
                "description": role["description"],
            }
            for role in SEED_ROLES
        ],
    )


def downgrade() -> None:
    """Remove seeded roles (fails if users still reference them)."""
    op.execute(delete(roles_table).where(roles_table.c.name.in_(ROLE_NAMES)))
