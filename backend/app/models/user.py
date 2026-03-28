from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    phone = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    extra_data = Column(JSON)

    roles = relationship("Role", secondary="user_roles", back_populates="users")
    permission_overrides = relationship(
        "UserPermission",
        back_populates="user",
        cascade="all, delete-orphan",
    )
