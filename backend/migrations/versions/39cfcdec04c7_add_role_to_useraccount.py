"""Add role to UserAccount

Revision ID: 39cfcdec04c7
Revises: c84942b94506
Create Date: 2025-05-23 17:48:31.883714

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '39cfcdec04c7'
down_revision: Union[str, None] = 'c84942b94506'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add the column as nullable first
    op.add_column('user_account', sa.Column('role', sa.String(), nullable=True))
    
    # Update existing records with a default value
    op.execute("UPDATE user_account SET role = 'user' WHERE role IS NULL")
    
    # Make the column non-nullable
    op.alter_column('user_account', 'role',
                    existing_type=sa.String(),
                    nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('user_account', 'role')
