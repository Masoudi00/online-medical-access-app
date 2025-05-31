"""Create comments table

Revision ID: 20240320_01
Revises: 20240320_03
Create Date: 2024-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import TIMESTAMP

# revision identifiers, used by Alembic.
revision = '20240320_01'
down_revision = '20240320_03'  # Updated to point to the merge migration
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('likes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Add indexes
    op.create_index('idx_comments_user_id', 'comments', ['user_id'])
    op.create_index('idx_comments_created_at', 'comments', ['created_at'])

def downgrade():
    op.drop_index('idx_comments_created_at')
    op.drop_index('idx_comments_user_id')
    op.drop_table('comments') 