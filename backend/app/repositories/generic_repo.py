from sqlalchemy.orm import Session


class GenericRepository:
    def __init__(self, model):
        self.model = model

    def _has_school_scope(self) -> bool:
        return hasattr(self.model, "school_id")

    def create(self, db: Session, data: dict):
        obj = self.model(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def list_all(self, db: Session, school_id: int | None = None):
        query = db.query(self.model)
        if school_id is not None and self._has_school_scope():
            query = query.filter(self.model.school_id == school_id)
        return query.order_by(self.model.id.asc()).all()

    def get_by_id(self, db: Session, obj_id: int, school_id: int | None = None):
        query = db.query(self.model).filter(self.model.id == obj_id)
        if school_id is not None and self._has_school_scope():
            query = query.filter(self.model.school_id == school_id)
        return query.first()

    def update(self, db: Session, obj, data: dict):
        for key, value in data.items():
            setattr(obj, key, value)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def delete(self, db: Session, obj):
        db.delete(obj)
        db.commit()

