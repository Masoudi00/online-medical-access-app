"""Add language and theme columns to UserAccount

Revision ID: add_language_theme_columns
Revises: 51856cb35228
Create Date: 2025-05-24 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision: str = 'add_language_theme_columns'
down_revision: Union[str, None] = '51856cb35228'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def has_column(table_name, column_name):
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def upgrade() -> None:
    """Upgrade schema."""
    # Check if columns exist before adding them
    if not has_column('user_account', 'language'):
        op.add_column('user_account', sa.Column('language', sa.String(), nullable=True))
        op.execute("UPDATE user_account SET language = 'en' WHERE language IS NULL")
    
    if not has_column('user_account', 'theme'):
        op.add_column('user_account', sa.Column('theme', sa.String(), nullable=True))
        op.execute("UPDATE user_account SET theme = 'light' WHERE theme IS NULL")

def downgrade() -> None:
    """Downgrade schema."""
    # We don't want to drop these columns on downgrade since they might be used by other migrations
    pass 