"""merge heads

Revision ID: 974a525f3092
Revises: 5b986d02f614, f84942b94510
Create Date: 2025-05-31 01:14:20.353289

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '974a525f3092'
down_revision: Union[str, None] = ('5b986d02f614', 'f84942b94510')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
