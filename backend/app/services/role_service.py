from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.role_repo import RoleRepository
from app.schemas.role import RoleCreate


class RoleService:

    def __init__(self):
        self.repo = RoleRepository()

    def create_role(self, db: Session, data: RoleCreate):
        existing_role = self.repo.get_by_name(db, data.name)
        if existing_role:
            raise HTTPException(status_code=400, detail="Role already exists")

        return self.repo.create(db, data.model_dump())

    def list_roles(self, db: Session):
        return self.repo.list_all(db)
