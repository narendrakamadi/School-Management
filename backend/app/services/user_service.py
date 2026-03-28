import uuid
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.user import User
from app.repositories.role_repo import RoleRepository
from app.repositories.user_repo import UserRepository
from app.core.security import hash_password
from app.rbac.roles import STUDENT
from app.schemas.people import StudentOnboardCreate
from app.schemas.user import UserCreate


class UserService:

    def __init__(self):
        self.repo = UserRepository()
        self.role_repo = RoleRepository()

    def has_users(self, db: Session) -> bool:
        return self.repo.count_all(db) > 0

    def list_users(self, db: Session):
        return self.repo.list_all(db)

    def create_user(self, db: Session, data: UserCreate):
        roles = self.role_repo.get_by_ids(db, data.role_ids)

        if len(roles) != len(set(data.role_ids)):
            raise HTTPException(status_code=400, detail="One or more roles do not exist")

        user_data = {
            "uuid": str(uuid.uuid4()),
            "first_name": data.first_name,
            "last_name": data.last_name,
            "email": data.email,
            "username": data.username,
            "hashed_password": hash_password(data.password),
            "roles": roles,
        }

        return self.repo.create(db, user_data)

    def onboard_student(self, db: Session, data: StudentOnboardCreate):
        student_role = self.role_repo.get_by_name(db, STUDENT)
        if not student_role:
            raise HTTPException(status_code=500, detail="Student role is not configured")

        required_role_ids = set(data.role_ids)
        required_role_ids.add(student_role.id)
        roles = self.role_repo.get_by_ids(db, list(required_role_ids))

        if len(roles) != len(required_role_ids):
            raise HTTPException(status_code=400, detail="One or more roles do not exist")

        user = User(
            uuid=str(uuid.uuid4()),
            first_name=data.first_name,
            last_name=data.last_name,
            email=str(data.email),
            username=data.username,
            hashed_password=hash_password(data.password),
            roles=roles,
        )

        try:
            db.add(user)
            db.flush()

            student = Student(user_id=user.id, **data.student.model_dump())
            db.add(student)

            db.commit()
            db.refresh(user)
            db.refresh(student)
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(status_code=400, detail="Unable to onboard student with provided data") from exc

        return {"user": user, "student": student}
