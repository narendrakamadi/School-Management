from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func

from app.models.permission import UserPermission
from app.models.role import Role
from app.models.user import User


class UserRepository:

    @staticmethod
    def _default_options():
        return (
            selectinload(User.roles).selectinload(Role.permissions),
            selectinload(User.permission_overrides).selectinload(UserPermission.permission),
        )

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
            .options(*self._default_options())
            .order_by(User.id.asc())
            .all()
        )

    def list_by_school(self, db: Session, school_id: int):
        return (
            db.query(User)
            .options(*self._default_options())
            .filter(User.school_id == school_id)
            .order_by(User.id.asc())
            .all()
        )

    def get_by_id(self, db: Session, user_id: int):
        return (
            db.query(User)
            .options(*self._default_options())
            .filter(User.id == user_id)
            .first()
        )

    def get_by_id_in_school(self, db: Session, user_id: int, school_id: int):
        return (
            db.query(User)
            .options(*self._default_options())
            .filter(User.id == user_id, User.school_id == school_id)
            .first()
        )

    def get_by_username(self, db: Session, username: str):
        return (
            db.query(User)
            .options(*self._default_options())
            .filter(User.username == username)
            .first()
        )

    def get_by_email(self, db: Session, email: str):
        normalized_email = email.strip().lower()
        return (
            db.query(User)
            .options(*self._default_options())
            .filter(func.lower(User.email) == normalized_email)
            .first()
        )

