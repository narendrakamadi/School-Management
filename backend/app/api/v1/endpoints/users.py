from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.rbac.dependencies import require_roles
from app.rbac.roles import ADMIN, SUPERADMIN
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import UserService

router = APIRouter()
service = UserService()


@router.get("/", response_model=list[UserOut], dependencies=[Depends(require_roles(ADMIN, SUPERADMIN))])
def list_users(db: Session = Depends(get_db)):
    return service.list_users(db)


@router.post("/bootstrap", response_model=UserOut)
def bootstrap_user(data: UserCreate, db: Session = Depends(get_db)):
    if service.has_users(db):
        raise HTTPException(status_code=403, detail="Bootstrap endpoint is disabled after first user creation")

    return service.create_user(db, data)


@router.post("/", response_model=UserOut, dependencies=[Depends(require_roles(ADMIN, SUPERADMIN))])
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return service.create_user(db, data)