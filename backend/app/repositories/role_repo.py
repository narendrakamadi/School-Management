from sqlalchemy.orm import Session, selectinload

from app.models.role import Role


class RoleRepository:

    @staticmethod
    def _default_options():
        return (selectinload(Role.permissions), selectinload(Role.menus))

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
            .options(*self._default_options())
            .filter(Role.id == role_id)
            .first()
        )

    def get_by_name(self, db: Session, name: str, school_id: int | None = None):
        query = db.query(Role).options(*self._default_options()).filter(Role.name == name)
        if school_id is not None:
            query = query.filter(Role.school_id == school_id)
        return (
            query.first()
        )

    def get_by_name_and_scope(self, db: Session, name: str, scope: str, school_id: int | None):
        query = (
            db.query(Role)
            .options(*self._default_options())
            .filter(Role.name == name, Role.scope == scope)
        )

        if school_id is None:
            query = query.filter(Role.school_id.is_(None))
        else:
            query = query.filter(Role.school_id == school_id)

        return query.first()

    def get_by_ids(self, db: Session, role_ids: list[int]):
        if not role_ids:
            return []
        return (
            db.query(Role)
            .options(*self._default_options())
            .filter(Role.id.in_(role_ids))
            .all()
        )

    def get_by_ids_for_scope(self, db: Session, role_ids: list[int], school_id: int | None, is_super_admin: bool):
        if not role_ids:
            return []

        query = db.query(Role).options(*self._default_options()).filter(Role.id.in_(role_ids))
        if is_super_admin:
            return query.all()

        return query.filter(Role.scope == "SCHOOL", Role.school_id == school_id).all()

    def list_all(self, db: Session):
        return (
            db.query(Role)
            .options(*self._default_options())
            .order_by(Role.id.asc())
            .all()
        )

    def list_by_school(self, db: Session, school_id: int):
        return (
            db.query(Role)
            .options(*self._default_options())
            .filter(Role.scope == "SCHOOL", Role.school_id == school_id)
            .order_by(Role.id.asc())
            .all()
        )
