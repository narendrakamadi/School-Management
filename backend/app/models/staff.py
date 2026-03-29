from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Staff(Base):
	__tablename__ = "staff"

	id = Column(Integer, primary_key=True)
	school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
	employee_id = Column(String, unique=True)
	designation = Column(String)
	department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
	joining_date = Column(Date)
	salary = Column(Integer)
	shift_timing = Column(String)
	status = Column(String)
	extra_data = Column(JSON)
	created_at = Column(DateTime(timezone=True), server_default=func.now())

	user = relationship("User")
	department = relationship("Department", back_populates="staff_members")

