from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_with_school_context
from app.db.session import get_db
from app.rbac.dependencies import require_any_permission
from app.schemas.common import DeleteResponse
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import UserService

router = APIRouter()
service = UserService()


@router.get("/", response_model=list[UserOut], dependencies=[Depends(require_any_permission("read_users"))])
def list_users(db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return service.list_users_for_actor(db, context.user)


@router.get("/{user_id}", response_model=UserOut, dependencies=[Depends(require_any_permission("read_users"))])
def get_user(user_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    user = service.get_user_for_actor(db, user_id, context.user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/bootstrap", response_model=UserOut)
def bootstrap_user(data: UserCreate, db: Session = Depends(get_db)):
    if service.has_users(db):
        raise HTTPException(status_code=403, detail="Bootstrap endpoint is disabled after first user creation")

    bootstrap_payload = data.model_copy(update={"is_super_admin": True, "school_id": None})
    return service.create_user(db, bootstrap_payload, actor=None)


@router.post("/", response_model=UserOut, dependencies=[Depends(require_any_permission("create_users"))])
def create_user(data: UserCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return service.create_user(db, data, actor=context.user)


@router.put("/{user_id}", response_model=UserOut, dependencies=[Depends(require_any_permission("update_users"))])
def update_user(user_id: int, data: UserCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    user = service.update_user(db, user_id, data, actor=context.user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_users"))])
def delete_user(user_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    result = service.delete_user(db, user_id, actor=context.user)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
