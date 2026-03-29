from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class Role(Base):
    __tablename__ = "roles"
    __table_args__ = (
        UniqueConstraint("name", "scope", "school_id", name="uq_roles_name_scope_school"),
    )

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    is_system = Column(Boolean, default=False)
    scope = Column(String, nullable=False, default="SCHOOL")
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=True, index=True)

    users = relationship("User", secondary="user_roles", back_populates="roles")
    user_role_links = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")
    school = relationship("School")
    permissions = relationship("Permission", secondary="role_permissions", back_populates="roles")
    menus = relationship("Menu", secondary="role_menus", back_populates="roles")
