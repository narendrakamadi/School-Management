from sqlalchemy.orm import Session

from app.models.permission import Permission


class PermissionRepository:

    def create(self, db: Session, data: dict):
        permission = Permission(**data)
        db.add(permission)
        db.commit()
        db.refresh(permission)
        return permission

    def get_by_id(self, db: Session, permission_id: int):
        return db.query(Permission).filter(Permission.id == permission_id).first()

    def get_by_name(self, db: Session, name: str):
        return db.query(Permission).filter(Permission.name == name).first()

    def get_by_ids(self, db: Session, permission_ids: list[int]):
        if not permission_ids:
            return []

        return db.query(Permission).filter(Permission.id.in_(permission_ids)).all()

    def list_all(self, db: Session):
        return db.query(Permission).order_by(Permission.module.asc(), Permission.action.asc()).all()
