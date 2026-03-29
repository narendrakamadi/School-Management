from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.permission import Permission
from app.models.role import Role
from app.models.school import School


class SchoolService:
    DEFAULT_SCHOOL_ROLES = [
        {"name": "admin", "description": "School administrator", "is_system": True},
        {"name": "teacher", "description": "Teacher role", "is_system": True},
        {"name": "student", "description": "Student role", "is_system": True},
        {"name": "parent", "description": "Parent role", "is_system": True},
        {"name": "staff", "description": "Staff role", "is_system": True},
    ]

    def create_school(self, db: Session, data, created_by: int | None):
        payload = data.model_dump(exclude_none=True)
        payload["created_by"] = created_by
        school = School(**payload)

        try:
            db.add(school)
            db.flush()

            school_roles = [
                Role(
                    name=role_data["name"],
                    description=role_data["description"],
                    is_system=role_data["is_system"],
                    scope="SCHOOL",
                    school_id=school.id,
                )
                for role_data in self.DEFAULT_SCHOOL_ROLES
            ]
            db.add_all(school_roles)
            db.flush()

            all_permissions = db.query(Permission).all()
            for role in school_roles:
                if role.name == "admin":
                    role.permissions = all_permissions

            db.commit()
            db.refresh(school)
            return school
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(status_code=400, detail="School with provided code already exists") from exc

    def list_schools(self, db: Session):
        return db.query(School).order_by(School.id.asc()).all()

    def get_school(self, db: Session, school_id: int):
        school = db.query(School).filter(School.id == school_id).first()
        if not school:
            raise HTTPException(status_code=404, detail="School not found")
        return school

    def update_school(self, db: Session, school_id: int, data):
        school = self.get_school(db, school_id)
        updates = data.model_dump(exclude_none=True)
        for key, value in updates.items():
            setattr(school, key, value)

        try:
            db.add(school)
            db.commit()
            db.refresh(school)
            return school
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(status_code=400, detail="School with provided code already exists") from exc

    def delete_school(self, db: Session, school_id: int):
        school = self.get_school(db, school_id)
        db.delete(school)
        db.commit()
        return {"message": "School deleted"}

