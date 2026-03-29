from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Student(Base):
	__tablename__ = "students"

	id = Column(Integer, primary_key=True)
	school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
	admission_number = Column(String, unique=True)
	roll_number = Column(String)
	class_id = Column(Integer, ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
	section_id = Column(Integer, ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
	date_of_birth = Column(Date)
	gender = Column(String)
	admission_date = Column(Date)
	academic_year = Column(String)
	parent_id = Column(Integer, ForeignKey("parents.id", ondelete="SET NULL"), nullable=True)
	address = Column(String)
	status = Column(String)
	extra_data = Column(JSON)
	created_at = Column(DateTime(timezone=True), server_default=func.now())

	user = relationship("User")
	parent = relationship("Parent", back_populates="students")
	school_class = relationship("SchoolClass", back_populates="students")
	section = relationship("Section", back_populates="students")
	attendance_entries = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
	marks = relationship("Mark", back_populates="student", cascade="all, delete-orphan")
	fees = relationship("Fee", back_populates="student", cascade="all, delete-orphan")

