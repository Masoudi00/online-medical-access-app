"""merge heads 2

Revision ID: g84942b94510
Revises: add_language_theme_columns, f84942b94509
Create Date: 2024-03-21 11:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'g84942b94510'
down_revision = ('add_language_theme_columns', 'f84942b94509')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass 