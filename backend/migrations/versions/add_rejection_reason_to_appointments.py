"""add rejection_reason to appointments

Revision ID: d84942b94507
Revises: c84942b94506
Create Date: 2024-03-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd84942b94507'
down_revision = 'c84942b94506'
branch_labels = None
depends_on = None


def upgrade():
    # Add rejection_reason column to appointments table
    op.add_column('appointments', sa.Column('rejection_reason', sa.String(), nullable=True))


def downgrade():
    # Remove rejection_reason column from appointments table
    op.drop_column('appointments', 'rejection_reason') 