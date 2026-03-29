from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.generic_repo import GenericRepository


class GenericService:
    def __init__(self, model, not_found_message: str):
        self.repo = GenericRepository(model)
        self.not_found_message = not_found_message
        self.resource_name = not_found_message.replace(" not found", "")

    @staticmethod
    def _resolve_school_scope(current_user) -> int | None:
        if not current_user:
            return None
        if getattr(current_user, "is_super_admin", False):
            return None
        return getattr(current_user, "active_school_id", None) or getattr(current_user, "school_id", None)

    def create(self, db: Session, data, current_user=None):
        payload = data.model_dump(exclude_none=True)
        school_scope = self._resolve_school_scope(current_user)
        if hasattr(self.repo.model, "school_id"):
            if school_scope is None:
                raise HTTPException(status_code=400, detail="School context is required")
            payload["school_id"] = school_scope
        return self.repo.create(db, payload)

    def list_all(self, db: Session, current_user=None):
        return self.repo.list_all(db, school_id=self._resolve_school_scope(current_user))

    def get(self, db: Session, obj_id: int, current_user=None):
        obj = self.repo.get_by_id(db, obj_id, school_id=self._resolve_school_scope(current_user))
        if not obj:
            raise HTTPException(status_code=404, detail=self.not_found_message)
        return obj

    def update(self, db: Session, obj_id: int, data, current_user=None):
        obj = self.get(db, obj_id, current_user=current_user)
        payload = data.model_dump(exclude_none=True)
        if hasattr(self.repo.model, "school_id"):
            payload.pop("school_id", None)
        return self.repo.update(db, obj, payload)

    def delete(self, db: Session, obj_id: int, current_user=None):
        obj = self.get(db, obj_id, current_user=current_user)
        self.repo.delete(db, obj)
        return {"message": f"{self.resource_name} deleted"}

