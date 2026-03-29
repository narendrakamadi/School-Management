from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_with_school_context
from app.db.session import get_db
from app.rbac.dependencies import require_roles
from app.rbac.roles import ADMIN
from app.schemas.permission import (
	EffectivePermissionResponse,
	PermissionCreate,
	PermissionOut,
	RolePermissionResponse,
	RolePermissionUpdate,
	UserPermissionResponse,
	UserPermissionUpdate,
)
from app.services.permission_service import PermissionService

router = APIRouter()
service = PermissionService()


@router.post("/", response_model=PermissionOut, dependencies=[Depends(require_roles(ADMIN))])
def create_permission(data: PermissionCreate, db: Session = Depends(get_db)):
	return service.create_permission(db, data)


@router.get("/", response_model=list[PermissionOut], dependencies=[Depends(require_roles(ADMIN))])
def list_permissions(db: Session = Depends(get_db)):
	return service.list_permissions(db)


@router.put("/roles/{role_id}", response_model=RolePermissionResponse, dependencies=[Depends(require_roles(ADMIN))])
def set_role_permissions(
	role_id: int,
	data: RolePermissionUpdate,
	db: Session = Depends(get_db),
	context=Depends(get_current_user_with_school_context),
):
	return service.set_role_permissions(db, role_id, data.permission_ids, actor=context.user)


@router.get("/roles/{role_id}", response_model=RolePermissionResponse, dependencies=[Depends(require_roles(ADMIN))])
def get_role_permissions(
	role_id: int,
	db: Session = Depends(get_db),
	context=Depends(get_current_user_with_school_context),
):
	return service.get_role_permissions(db, role_id, actor=context.user)


@router.put("/users/{user_id}", response_model=UserPermissionResponse, dependencies=[Depends(require_roles(ADMIN))])
def set_user_permissions(
	user_id: int,
	data: UserPermissionUpdate,
	db: Session = Depends(get_db),
	context=Depends(get_current_user_with_school_context),
):
	return service.set_user_permissions(db, user_id, data, actor=context.user)


@router.get("/users/{user_id}", response_model=UserPermissionResponse, dependencies=[Depends(require_roles(ADMIN))])
def get_user_permissions(
	user_id: int,
	db: Session = Depends(get_db),
	context=Depends(get_current_user_with_school_context),
):
	return service.get_user_permissions(db, user_id, actor=context.user)


@router.get("/users/{user_id}/effective", response_model=EffectivePermissionResponse, dependencies=[Depends(require_roles(ADMIN))])
def get_effective_permissions(
	user_id: int,
	db: Session = Depends(get_db),
	context=Depends(get_current_user_with_school_context),
):
	return service.get_effective_permissions(db, user_id, actor=context.user)


@router.get("/me/effective", response_model=EffectivePermissionResponse)
def get_my_effective_permissions(context=Depends(get_current_user_with_school_context)):
	return service.build_effective_permission_response(context.user)

