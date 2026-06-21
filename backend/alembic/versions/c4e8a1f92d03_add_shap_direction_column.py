"""add shap direction column

Revision ID: c4e8a1f92d03
Revises: 1152e8c4f00f
Create Date: 2026-06-11 20:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c4e8a1f92d03"
down_revision: Union[str, Sequence[str], None] = "1152e8c4f00f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "shap_explanations",
        sa.Column("direction", sa.String(length=30), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("shap_explanations", "direction")
