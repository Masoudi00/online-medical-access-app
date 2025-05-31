from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base

# Association table for comment likes
comment_likes = Table(
    'comment_likes',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('user_account.id', ondelete='CASCADE')),
    Column('comment_id', Integer, ForeignKey('comments.id', ondelete='CASCADE')),
)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("user_account.id", ondelete="CASCADE"), nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("UserAccount", back_populates="comments")
    replies = relationship("Reply", back_populates="comment", cascade="all, delete-orphan")
    liked_by = relationship(
        "UserAccount",
        secondary=comment_likes,
        backref="liked_comments",
        lazy="joined"
    )

    def to_dict(self, current_user=None):
        return {
            "id": self.id,
            "content": self.content,
            "user_id": self.user_id,
            "likes": self.likes,
            "created_at": self.created_at.isoformat(),
            "user": {
                "id": self.user.id,
                "first_name": self.user.first_name,
                "last_name": self.user.last_name,
                "role": self.user.role,
                "profile_picture": self.user.profile_picture
            },
            "replies": [reply.to_dict() for reply in self.replies],
            "is_liked": any(user.id == current_user.id for user in self.liked_by) if current_user else False
        }

class Reply(Base):
    __tablename__ = "replies"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    comment_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("user_account.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    comment = relationship("Comment", back_populates="replies")
    user = relationship("UserAccount", back_populates="replies")

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "comment_id": self.comment_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "user": {
                "id": self.user.id,
                "first_name": self.user.first_name,
                "last_name": self.user.last_name,
                "role": self.user.role,
                "profile_picture": self.user.profile_picture
            }
        } 