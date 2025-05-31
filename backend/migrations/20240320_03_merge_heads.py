"""Merge heads f84942b94510 and g84942b94510

Revision ID: 20240320_03
Revises: f84942b94510, g84942b94510
Create Date: 2024-03-20 10:02:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision = '20240320_03'
down_revision = ('f84942b94510', 'g84942b94510')
branch_labels = None
depends_on = None

def has_column(table_name, column_name):
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def upgrade():
    # Check if language and theme columns exist before trying to add them
    if not has_column('user_account', 'language'):
        op.add_column('user_account', sa.Column('language', sa.String(), nullable=True))
        op.execute("UPDATE user_account SET language = 'en' WHERE language IS NULL")
    
    if not has_column('user_account', 'theme'):
        op.add_column('user_account', sa.Column('theme', sa.String(), nullable=True))
        op.execute("UPDATE user_account SET theme = 'light' WHERE theme IS NULL")

def downgrade():
    # We don't want to drop these columns on downgrade since they might be used by other migrations
    pass 