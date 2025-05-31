"""add insurance fields to user

Revision ID: f84942b94510
Revises: f84942b94509
Create Date: 2024-03-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f84942b94510'
down_revision = 'f84942b94509'
branch_labels = None
depends_on = None


def upgrade():
    # Add insurance fields to user_account table
    op.add_column('user_account', sa.Column('insurance_provider', sa.String(), nullable=True))
    op.add_column('user_account', sa.Column('insurance_id', sa.String(), nullable=True))


def downgrade():
    # Remove insurance fields from user_account table
    op.drop_column('user_account', 'insurance_id')
    op.drop_column('user_account', 'insurance_provider') 