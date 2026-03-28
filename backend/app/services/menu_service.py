from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.menu import Menu
from app.repositories.generic_repo import GenericRepository
from app.repositories.role_repo import RoleRepository
from app.schemas.menu import RoleMenuResponse


class MenuService:
    def __init__(self):
        self.menu_repo = GenericRepository(Menu)
        self.role_repo = RoleRepository()

    def create_menu(self, db: Session, data):
        return self.menu_repo.create(db, data.model_dump())

    def list_menus(self, db: Session):
        return self.menu_repo.list_all(db)

    def get_menu(self, db: Session, menu_id: int):
        menu = self.menu_repo.get_by_id(db, menu_id)
        if not menu:
            raise HTTPException(status_code=404, detail="Menu not found")
        return menu

    def delete_menu(self, db: Session, menu_id: int):
        menu = self.get_menu(db, menu_id)
        self.menu_repo.delete(db, menu)
        return {"message": "Menu deleted"}

    def set_role_menus(self, db: Session, role_id: int, menu_ids: list[int]):
        role = self.role_repo.get_by_id(db, role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        unique_menu_ids = list(dict.fromkeys(menu_ids))
        menus = db.query(Menu).filter(Menu.id.in_(unique_menu_ids)).all() if unique_menu_ids else []
        if len(menus) != len(unique_menu_ids):
            raise HTTPException(status_code=400, detail="One or more menus do not exist")

        role.menus = menus
        role = self.role_repo.save(db, role)
        return RoleMenuResponse(role=role, menus=sorted(role.menus, key=lambda menu: menu.id))

    def get_role_menus(self, db: Session, role_id: int):
        role = self.role_repo.get_by_id(db, role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        return RoleMenuResponse(role=role, menus=sorted(role.menus, key=lambda menu: menu.id))

