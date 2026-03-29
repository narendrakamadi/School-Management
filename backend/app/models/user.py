from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String
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
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="SET NULL"), nullable=True, index=True)
    is_super_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    extra_data = Column(JSON)

    roles = relationship("Role", secondary="user_roles", back_populates="users")
    school = relationship("School", foreign_keys=[school_id], back_populates="users")
    created_schools = relationship("School", foreign_keys="School.created_by", back_populates="creator")
    user_role_links = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    permission_overrides = relationship(
        "UserPermission",
        back_populates="user",
        cascade="all, delete-orphan",
    )
