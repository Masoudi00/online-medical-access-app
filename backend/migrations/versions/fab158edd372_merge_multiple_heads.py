"""merge multiple heads

Revision ID: fab158edd372
Revises: add_notification_fields_2024, 2024_03_21_notif
Create Date: 2025-05-31 16:45:03.390234

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fab158edd372'
down_revision: Union[str, None] = ('add_notification_fields_2024', '2024_03_21_notif')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
