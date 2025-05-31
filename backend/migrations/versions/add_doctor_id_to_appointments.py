"""add doctor_id to appointments

Revision ID: f84942b94509
Revises: e84942b94508
Create Date: 2024-03-21 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f84942b94509'
down_revision = 'e84942b94508'
branch_labels = None
depends_on = None


def upgrade():
    # Add doctor_id column to appointments table
    op.add_column('appointments', sa.Column('doctor_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_appointments_doctor_id',
        'appointments', 'user_account',
        ['doctor_id'], ['id']
    )


def downgrade():
    # Remove doctor_id column from appointments table
    op.drop_constraint('fk_appointments_doctor_id', 'appointments', type_='foreignkey')
    op.drop_column('appointments', 'doctor_id') 