from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)

    school_class = relationship("SchoolClass", back_populates="sections")
    students = relationship("Student", back_populates="section")
    assignments = relationship("TeacherAssignment", back_populates="section")

