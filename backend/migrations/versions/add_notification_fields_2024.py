"""add notification fields 2024

Revision ID: 2024_03_21_notif
Revises: bb832463a6be
Create Date: 2024-03-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
from app.schemas.notification import NotificationType

# revision identifiers, used by Alembic.
revision: str = '2024_03_21_notif'
down_revision: Union[str, None] = 'bb832463a6be'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create the enum type first
    notification_type_enum = sa.Enum(NotificationType, name='notificationtype')
    notification_type_enum.create(op.get_bind(), checkfirst=True)
    
    # Add new columns to notification table
    op.add_column('notification', sa.Column('type', notification_type_enum))
    op.add_column('notification', sa.Column('link', sa.String(), nullable=True))
    op.add_column('notification', sa.Column('notification_metadata', sa.JSON(), nullable=True))
    
    # Update existing rows to have the default value
    op.execute("UPDATE notification SET type = 'SYSTEM'")
    
    # Make the column non-nullable with default
    op.alter_column('notification', 'type',
                    nullable=False,
                    server_default=text("'SYSTEM'::notificationtype"))

def downgrade() -> None:
    # Remove the columns if we need to roll back
    op.drop_column('notification', 'notification_metadata')
    op.drop_column('notification', 'link')
    op.drop_column('notification', 'type')
    
    # Drop the enum type
    notification_type_enum = sa.Enum(NotificationType, name='notificationtype')
    notification_type_enum.drop(op.get_bind()) 