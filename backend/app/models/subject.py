from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True)

    assignments = relationship("TeacherAssignment", back_populates="subject")
    marks = relationship("Mark", back_populates="subject")

