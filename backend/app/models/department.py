from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    teachers = relationship("Teacher", back_populates="department")
    staff_members = relationship("Staff", back_populates="department")

