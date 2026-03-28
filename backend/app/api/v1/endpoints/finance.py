from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.fee import Fee
from app.models.payment import Payment
from app.rbac.dependencies import require_any_permission
from app.schemas.common import DeleteResponse
from app.schemas.finance import FeeCreate, FeeOut, PaymentCreate, PaymentOut
from app.services.generic_service import GenericService

router = APIRouter()

fee_service = GenericService(Fee, "Fee not found")
payment_service = GenericService(Payment, "Payment not found")


@router.post("/fees", response_model=FeeOut, dependencies=[Depends(require_any_permission("create_fees"))])
def create_fee(data: FeeCreate, db: Session = Depends(get_db)):
    return fee_service.create(db, data)


@router.get("/fees", response_model=list[FeeOut], dependencies=[Depends(require_any_permission("read_fees"))])
def list_fees(db: Session = Depends(get_db)):
    return fee_service.list_all(db)


@router.get("/fees/{fee_id}", response_model=FeeOut, dependencies=[Depends(require_any_permission("read_fees"))])
def get_fee(fee_id: int, db: Session = Depends(get_db)):
    return fee_service.get(db, fee_id)


@router.delete("/fees/{fee_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_fees"))])
def delete_fee(fee_id: int, db: Session = Depends(get_db)):
    return fee_service.delete(db, fee_id)


@router.post("/payments", response_model=PaymentOut, dependencies=[Depends(require_any_permission("create_payments"))])
def create_payment(data: PaymentCreate, db: Session = Depends(get_db)):
    return payment_service.create(db, data)


@router.get("/payments", response_model=list[PaymentOut], dependencies=[Depends(require_any_permission("read_payments"))])
def list_payments(db: Session = Depends(get_db)):
    return payment_service.list_all(db)


@router.get("/payments/{payment_id}", response_model=PaymentOut, dependencies=[Depends(require_any_permission("read_payments"))])
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    return payment_service.get(db, payment_id)


@router.delete("/payments/{payment_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_payments"))])
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    return payment_service.delete(db, payment_id)

