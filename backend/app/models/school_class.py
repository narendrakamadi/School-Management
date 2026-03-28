from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class SchoolClass(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    sections = relationship("Section", back_populates="school_class", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="school_class")
    assignments = relationship("TeacherAssignment", back_populates="school_class")

