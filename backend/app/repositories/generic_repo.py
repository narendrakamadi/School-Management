from sqlalchemy.orm import Session


class GenericRepository:
    def __init__(self, model):
        self.model = model

    def create(self, db: Session, data: dict):
        obj = self.model(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def list_all(self, db: Session):
        return db.query(self.model).order_by(self.model.id.asc()).all()

    def get_by_id(self, db: Session, obj_id: int):
        return db.query(self.model).filter(self.model.id == obj_id).first()

    def delete(self, db: Session, obj):
        db.delete(obj)
        db.commit()

