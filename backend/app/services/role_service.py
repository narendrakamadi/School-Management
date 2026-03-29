from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.role_repo import RoleRepository
from app.schemas.role import RoleCreate


class RoleService:

    def __init__(self):
        self.repo = RoleRepository()

    def create_role(self, db: Session, data: RoleCreate, current_user):
        requested_scope = (data.scope or "SCHOOL").upper()

        if requested_scope == "GLOBAL" and not current_user.is_super_admin:
            raise HTTPException(status_code=403, detail="Only super admin can create global roles")

        if requested_scope not in {"GLOBAL", "SCHOOL"}:
            raise HTTPException(status_code=400, detail="Invalid role scope")

        school_id = None
        if requested_scope == "SCHOOL":
            school_id = data.school_id if current_user.is_super_admin else current_user.school_id
            if school_id is None:
                raise HTTPException(status_code=400, detail="school_id is required for school-scoped roles")

        existing_role = self.repo.get_by_name_and_scope(db, data.name, requested_scope, school_id)
        if existing_role:
            raise HTTPException(status_code=400, detail="Role already exists")

        payload = data.model_dump(exclude_none=True)
        payload["scope"] = requested_scope
        payload["school_id"] = school_id
        return self.repo.create(db, payload)

    def list_roles(self, db: Session, current_user):
        if current_user.is_super_admin:
            return self.repo.list_all(db)

        if not current_user.school_id:
            raise HTTPException(status_code=403, detail="User is not assigned to a school")

        return self.repo.list_by_school(db, current_user.school_id)

