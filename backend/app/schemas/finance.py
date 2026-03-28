from datetime import date

from pydantic import BaseModel


class FeeBase(BaseModel):
    student_id: int
    amount: int
    due_date: date | None = None
    status: str | None = None


class FeeCreate(FeeBase):
    pass


class FeeOut(FeeBase):
    id: int

    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    fee_id: int
    amount_paid: int
    payment_date: date | None = None
    payment_mode: str | None = None
    transaction_id: str | None = None


class PaymentCreate(PaymentBase):
    pass


class PaymentOut(PaymentBase):
    id: int

    class Config:
        from_attributes = True

