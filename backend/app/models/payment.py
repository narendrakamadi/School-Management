from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    fee_id = Column(Integer, ForeignKey("fees.id", ondelete="CASCADE"), nullable=False)
    amount_paid = Column(Integer, nullable=False)
    payment_date = Column(Date)
    payment_mode = Column(String)
    transaction_id = Column(String)

    fee = relationship("Fee", back_populates="payments")

