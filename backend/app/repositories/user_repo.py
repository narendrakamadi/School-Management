from sqlalchemy.orm import Session, selectinload

from app.models.permission import UserPermission
from app.models.role import Role
from app.models.user import User


class UserRepository:

    def count_all(self, db: Session) -> int:
        return db.query(User).count()

    def create(self, db: Session, data: dict):
        user = User(**data)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def list_all(self, db: Session):
        return (
            db.query(User)
            .options(
                selectinload(User.roles).selectinload(Role.permissions),
                selectinload(User.permission_overrides).selectinload(UserPermission.permission),
            )
            .order_by(User.id.asc())
            .all()
        )

    def get_by_id(self, db: Session, user_id: int):
        return (
            db.query(User)
            .options(
                selectinload(User.roles).selectinload(Role.permissions),
                selectinload(User.permission_overrides).selectinload(UserPermission.permission),
            )
            .filter(User.id == user_id)
            .first()
        )

    def get_by_username(self, db: Session, username: str):
        return (
            db.query(User)
            .options(
                selectinload(User.roles).selectinload(Role.permissions),
                selectinload(User.permission_overrides).selectinload(UserPermission.permission),
            )
            .filter(User.username == username)
            .first()
        )
