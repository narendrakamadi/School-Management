from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Permission(Base):
	__tablename__ = "permissions"

	id = Column(Integer, primary_key=True)
	name = Column(String, unique=True, nullable=False)
	module = Column(String, nullable=False)
	action = Column(String, nullable=False)

	roles = relationship("Role", secondary="role_permissions", back_populates="permissions")
	user_overrides = relationship(
		"UserPermission",
		back_populates="permission",
		cascade="all, delete-orphan",
	)


class RolePermission(Base):
	__tablename__ = "role_permissions"

	role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
	permission_id = Column(
		Integer,
		ForeignKey("permissions.id", ondelete="CASCADE"),
		primary_key=True,
	)


class UserPermission(Base):
	__tablename__ = "user_permissions"

	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
	permission_id = Column(
		Integer,
		ForeignKey("permissions.id", ondelete="CASCADE"),
		primary_key=True,
	)
	is_allowed = Column(Boolean, nullable=False, default=True)

	user = relationship("User", back_populates="permission_overrides")
	permission = relationship("Permission", back_populates="user_overrides")

