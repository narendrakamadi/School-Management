from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.generic_repo import GenericRepository


class GenericService:
    def __init__(self, model, not_found_message: str):
        self.repo = GenericRepository(model)
        self.not_found_message = not_found_message
        self.resource_name = not_found_message.replace(" not found", "")

    def create(self, db: Session, data):
        return self.repo.create(db, data.model_dump())

    def list_all(self, db: Session):
        return self.repo.list_all(db)

    def get(self, db: Session, obj_id: int):
        obj = self.repo.get_by_id(db, obj_id)
        if not obj:
            raise HTTPException(status_code=404, detail=self.not_found_message)
        return obj

    def delete(self, db: Session, obj_id: int):
        obj = self.get(db, obj_id)
        self.repo.delete(db, obj)
        return {"message": f"{self.resource_name} deleted"}

