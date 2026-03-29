from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_with_school_context
from app.db.session import get_db
from app.rbac.dependencies import require_roles
from app.schemas.role import RoleCreate, RoleOut
from app.services.role_service import RoleService

router = APIRouter()
service = RoleService()


@router.post("/", response_model=RoleOut, dependencies=[Depends(require_roles("admin"))])
def create_role(data: RoleCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
	return service.create_role(db, data, context.user)


@router.get("/", response_model=list[RoleOut], dependencies=[Depends(require_roles("admin"))])
def list_roles(db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
	return service.list_roles(db, context.user)

