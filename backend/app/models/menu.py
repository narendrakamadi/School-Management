from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Menu(Base):
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    path = Column(String)
    icon = Column(String)
    parent_id = Column(Integer, ForeignKey("menus.id", ondelete="SET NULL"), nullable=True)
    order_index = Column(Integer, default=0)

    parent = relationship("Menu", remote_side=[id], back_populates="children")
    children = relationship("Menu", back_populates="parent", cascade="all, delete-orphan")
    roles = relationship("Role", secondary="role_menus", back_populates="menus")

