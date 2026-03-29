from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_with_school_context
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
def create_fee(data: FeeCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return fee_service.create(db, data, current_user=context.user)


@router.get("/fees", response_model=list[FeeOut], dependencies=[Depends(require_any_permission("read_fees"))])
def list_fees(db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return fee_service.list_all(db, current_user=context.user)


@router.get("/fees/{fee_id}", response_model=FeeOut, dependencies=[Depends(require_any_permission("read_fees"))])
def get_fee(fee_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return fee_service.get(db, fee_id, current_user=context.user)


@router.put("/fees/{fee_id}", response_model=FeeOut, dependencies=[Depends(require_any_permission("update_fees"))])
def update_fee(fee_id: int, data: FeeCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return fee_service.update(db, fee_id, data, current_user=context.user)


@router.delete("/fees/{fee_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_fees"))])
def delete_fee(fee_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return fee_service.delete(db, fee_id, current_user=context.user)


@router.post("/payments", response_model=PaymentOut, dependencies=[Depends(require_any_permission("create_payments"))])
def create_payment(data: PaymentCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return payment_service.create(db, data, current_user=context.user)


@router.get("/payments", response_model=list[PaymentOut], dependencies=[Depends(require_any_permission("read_payments"))])
def list_payments(db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return payment_service.list_all(db, current_user=context.user)


@router.get("/payments/{payment_id}", response_model=PaymentOut, dependencies=[Depends(require_any_permission("read_payments"))])
def get_payment(payment_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return payment_service.get(db, payment_id, current_user=context.user)


@router.put("/payments/{payment_id}", response_model=PaymentOut, dependencies=[Depends(require_any_permission("update_payments"))])
def update_payment(payment_id: int, data: PaymentCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return payment_service.update(db, payment_id, data, current_user=context.user)


@router.delete("/payments/{payment_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_payments"))])
def delete_payment(payment_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return payment_service.delete(db, payment_id, current_user=context.user)

