from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Fee(Base):
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True)
    school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    due_date = Column(Date)
    status = Column(String)

    student = relationship("Student", back_populates="fees")
    payments = relationship("Payment", back_populates="fee", cascade="all, delete-orphan")

