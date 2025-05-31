"""Create comment likes table

Revision ID: create_comment_likes_table
Revises: bb832463a6be
Create Date: 2024-05-31 01:20:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'create_comment_likes_table'
down_revision = 'bb832463a6be'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'comment_likes',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('comment_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user_account.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['comment_id'], ['comments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'comment_id')
    )

def downgrade():
    op.drop_table('comment_likes') 