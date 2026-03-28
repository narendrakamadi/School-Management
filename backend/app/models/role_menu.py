from sqlalchemy import Column, ForeignKey, Integer

from app.db.base import Base


class RoleMenu(Base):
    __tablename__ = "role_menus"

    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
    menu_id = Column(Integer, ForeignKey("menus.id", ondelete="CASCADE"), primary_key=True)

