from sqlalchemy.orm import Session, selectinload

from app.models.role import Role


class RoleRepository:

    def create(self, db: Session, data: dict):
        role = Role(**data)
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

    def save(self, db: Session, role: Role):
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

    def get_by_id(self, db: Session, role_id: int):
        return (
            db.query(Role)
            .options(selectinload(Role.permissions), selectinload(Role.menus))
            .filter(Role.id == role_id)
            .first()
        )

    def get_by_name(self, db: Session, name: str):
        return (
            db.query(Role)
            .options(selectinload(Role.permissions), selectinload(Role.menus))
            .filter(Role.name == name)
            .first()
        )

    def get_by_ids(self, db: Session, role_ids: list[int]):
        if not role_ids:
            return []
        return (
            db.query(Role)
            .options(selectinload(Role.permissions), selectinload(Role.menus))
            .filter(Role.id.in_(role_ids))
            .all()
        )

    def list_all(self, db: Session):
        return (
            db.query(Role)
            .options(selectinload(Role.permissions), selectinload(Role.menus))
            .order_by(Role.id.asc())
            .all()
        )
