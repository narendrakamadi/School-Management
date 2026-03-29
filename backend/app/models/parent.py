from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Parent(Base):
	__tablename__ = "parents"

	id = Column(Integer, primary_key=True)
	school_id = Column(Integer, ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
	user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
	occupation = Column(String)
	annual_income = Column(Integer)
	relation_type = Column(String)
	address = Column(String)
	extra_data = Column(JSON)
	created_at = Column(DateTime(timezone=True), server_default=func.now())

	user = relationship("User")
	students = relationship("Student", back_populates="parent")

