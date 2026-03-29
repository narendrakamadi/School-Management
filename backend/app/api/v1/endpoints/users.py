from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.rbac.dependencies import require_any_permission, require_roles
from app.rbac.roles import ADMIN, SUPERADMIN
from app.schemas.common import DeleteResponse
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import UserService

router = APIRouter()
service = UserService()


@router.get("/", response_model=list[UserOut], dependencies=[Depends(require_any_permission("read_users"))])
def list_users(db: Session = Depends(get_db)):
    return service.list_users(db)


@router.get("/{user_id}", response_model=UserOut, dependencies=[Depends(require_any_permission("read_users"))])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/bootstrap", response_model=UserOut)
def bootstrap_user(data: UserCreate, db: Session = Depends(get_db)):
    if service.has_users(db):
        raise HTTPException(status_code=403, detail="Bootstrap endpoint is disabled after first user creation")

    return service.create_user(db, data)


@router.post("/", response_model=UserOut, dependencies=[Depends(require_any_permission("create_users"))])
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return service.create_user(db, data)


@router.put("/{user_id}", response_model=UserOut, dependencies=[Depends(require_any_permission("update_users"))])
def update_user(user_id: int, data: UserCreate, db: Session = Depends(get_db)):
    user = service.update_user(db, user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_users"))])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    result = service.delete_user(db, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
