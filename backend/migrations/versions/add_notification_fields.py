"""add notification fields

Revision ID: add_notification_fields_2024
Revises: bb832463a6be, create_comment_likes_table
Create Date: 2024-03-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.schemas.notification import NotificationType

# revision identifiers, used by Alembic.
revision: str = 'add_notification_fields_2024'
down_revision: Union[str, None] = ('bb832463a6be', 'create_comment_likes_table')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create the enum type first
    notification_type_enum = sa.Enum(NotificationType, name='notificationtype')
    notification_type_enum.create(op.get_bind(), checkfirst=True)
    
    # Add new columns to notification table
    op.add_column('notification', sa.Column('type', notification_type_enum, nullable=False, server_default='system'))
    op.add_column('notification', sa.Column('link', sa.String(), nullable=True))
    op.add_column('notification', sa.Column('notification_metadata', sa.JSON(), nullable=True))

def downgrade() -> None:
    # Remove the columns if we need to roll back
    op.drop_column('notification', 'notification_metadata')
    op.drop_column('notification', 'link')
    op.drop_column('notification', 'type')
    
    # Drop the enum type
    notification_type_enum = sa.Enum(NotificationType, name='notificationtype')
    notification_type_enum.drop(op.get_bind()) 