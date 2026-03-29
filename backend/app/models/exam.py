from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    exam_type = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)

    marks = relationship("Mark", back_populates="exam")

