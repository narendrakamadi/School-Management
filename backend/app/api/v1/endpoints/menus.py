from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_with_school_context
from app.db.session import get_db
from app.rbac.dependencies import require_any_permission
from app.schemas.common import DeleteResponse
from app.schemas.menu import MenuCreate, MenuOut, RoleMenuResponse, RoleMenuUpdate
from app.services.menu_service import MenuService

router = APIRouter()
service = MenuService()


@router.post("/menus", response_model=MenuOut, dependencies=[Depends(require_any_permission("create_menus"))])
def create_menu(data: MenuCreate, db: Session = Depends(get_db)):
    return service.create_menu(db, data)


@router.get("/menus", response_model=list[MenuOut], dependencies=[Depends(require_any_permission("read_menus"))])
def list_menus(db: Session = Depends(get_db)):
    return service.list_menus(db)


@router.get("/menus/{menu_id}", response_model=MenuOut, dependencies=[Depends(require_any_permission("read_menus"))])
def get_menu(menu_id: int, db: Session = Depends(get_db)):
    return service.get_menu(db, menu_id)


@router.delete("/menus/{menu_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_menus"))])
def delete_menu(menu_id: int, db: Session = Depends(get_db)):
    return service.delete_menu(db, menu_id)


@router.put("/role-menus/{role_id}", response_model=RoleMenuResponse, dependencies=[Depends(require_any_permission("update_menus", "update_roles"))])
def set_role_menus(
    role_id: int,
    data: RoleMenuUpdate,
    db: Session = Depends(get_db),
    context=Depends(get_current_user_with_school_context),
):
    return service.set_role_menus(db, role_id, data.menu_ids, actor=context.user)


@router.get("/role-menus/{role_id}", response_model=RoleMenuResponse, dependencies=[Depends(require_any_permission("read_menus", "read_roles"))])
def get_role_menus(
    role_id: int,
    db: Session = Depends(get_db),
    context=Depends(get_current_user_with_school_context),
):
    return service.get_role_menus(db, role_id, actor=context.user)

