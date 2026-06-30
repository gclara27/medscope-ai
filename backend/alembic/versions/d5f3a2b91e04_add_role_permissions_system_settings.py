"""add role permissions and system settings

Revision ID: d5f3a2b91e04
Revises: c4e8a1f92d03
Create Date: 2026-06-11 22:00:00.000000

"""

from __future__ import annotations

import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from seeds.permissions import DEFAULT_ROLE_PERMISSIONS
from seeds.roles import SEED_ROLES
from seeds.system_settings import SYSTEM_SETTING_DEFAULTS

revision: str = "d5f3a2b91e04"
down_revision: Union[str, Sequence[str], None] = "c4e8a1f92d03"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("roles", sa.Column("permissions", sa.JSON(), nullable=True))
    op.create_table(
        "system_settings",
        sa.Column("key", sa.String(length=100), nullable=False),
        sa.Column("value", sa.JSON(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("key"),
    )

    connection = op.get_bind()
    for role in SEED_ROLES:
        permissions = DEFAULT_ROLE_PERMISSIONS.get(role["name"], {})
        connection.execute(
            sa.text(
                "UPDATE roles SET permissions = CAST(:permissions AS JSON) WHERE name = :name",
            ),
            {
                "name": role["name"],
                "permissions": json.dumps(dict(permissions)),
            },
        )

    settings_table = sa.table(
        "system_settings",
        sa.column("key", sa.String()),
        sa.column("value", sa.JSON()),
        sa.column("description", sa.Text()),
    )
    op.bulk_insert(
        settings_table,
        [
            {
                "key": item["key"],
                "value": item["value"],
                "description": item["description"],
            }
            for item in SYSTEM_SETTING_DEFAULTS
        ],
    )


def downgrade() -> None:
    op.drop_table("system_settings")
    op.drop_column("roles", "permissions")
