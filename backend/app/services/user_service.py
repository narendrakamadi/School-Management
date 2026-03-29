import uuid
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.user import User
from app.models.user_role import UserRole
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

    def list_users_for_actor(self, db: Session, current_user):
        if current_user.is_super_admin:
            return self.repo.list_all(db)
        return self.repo.list_by_school(db, current_user.school_id)

    @staticmethod
    def _resolve_new_user_school_id(data: UserCreate, actor) -> int | None:
        if data.is_super_admin:
            return None

        if actor is not None and not actor.is_super_admin:
            return actor.school_id

        return data.school_id

    @staticmethod
    def _replace_user_roles(user: User, roles: list, school_id: int | None):
        user.user_role_links = [
            UserRole(
                role_id=role.id,
                role=role,
                school_id=role.school_id if role.scope == "SCHOOL" else school_id,
            )
            for role in roles
        ]

    def create_user(self, db: Session, data: UserCreate, actor=None):
        is_super_admin = bool(data.is_super_admin)

        if actor is not None and not actor.is_super_admin and is_super_admin:
            raise HTTPException(status_code=403, detail="Only super admin can create super admin users")

        school_id = self._resolve_new_user_school_id(data, actor)
        if not is_super_admin and school_id is None:
            raise HTTPException(status_code=400, detail="school_id is required for non-super-admin users")

        requester_is_super_admin = bool(actor.is_super_admin) if actor is not None else True
        roles = self.role_repo.get_by_ids_for_scope(db, data.role_ids, school_id, requester_is_super_admin)

        if len(roles) != len(set(data.role_ids)):
            raise HTTPException(status_code=400, detail="One or more roles do not exist")

        if not is_super_admin and any(role.scope == "GLOBAL" for role in roles):
            raise HTTPException(status_code=400, detail="Global roles can only be assigned to super admin users")

        if not requester_is_super_admin and any(role.scope == "GLOBAL" for role in roles):
            raise HTTPException(status_code=403, detail="Global roles can only be assigned by super admin")

        user = User(
            uuid=str(uuid.uuid4()),
            first_name=data.first_name,
            last_name=data.last_name,
            email=str(data.email),
            username=data.username,
            hashed_password=hash_password(data.password),
            school_id=school_id,
            is_super_admin=is_super_admin,
        )
        self._replace_user_roles(user, roles, school_id)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def get_user_for_actor(self, db: Session, user_id: int, current_user):
        if current_user.is_super_admin:
            return self.repo.get_by_id(db, user_id)
        return self.repo.get_by_id_in_school(db, user_id, current_user.school_id)

    def update_user(self, db: Session, user_id: int, data: UserCreate, actor=None):
        user = self.get_user_for_actor(db, user_id, actor) if actor else self.repo.get_by_id(db, user_id)
        if not user:
            return None

        user.first_name = data.first_name
        user.last_name = data.last_name
        user.email = str(data.email)
        user.username = data.username
        user.hashed_password = hash_password(data.password)

        if actor is not None and actor.is_super_admin:
            user.is_super_admin = bool(data.is_super_admin)
            user.school_id = None if user.is_super_admin else (data.school_id or user.school_id)

        target_school_id = user.school_id
        requester_is_super_admin = bool(actor.is_super_admin) if actor is not None else True
        roles = self.role_repo.get_by_ids_for_scope(db, data.role_ids, target_school_id, requester_is_super_admin)
        if len(roles) != len(set(data.role_ids)):
            raise HTTPException(status_code=400, detail="One or more roles do not exist")

        if not user.is_super_admin and any(role.scope == "GLOBAL" for role in roles):
            raise HTTPException(status_code=400, detail="Global roles can only be assigned to super admin users")

        self._replace_user_roles(user, roles, target_school_id)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def delete_user(self, db: Session, user_id: int, actor=None):
        user = self.get_user_for_actor(db, user_id, actor) if actor else self.repo.get_by_id(db, user_id)
        if not user:
            return False
        db.delete(user)
        db.commit()
        return True

    def onboard_student(self, db: Session, data: StudentOnboardCreate, actor=None):
        school_id = actor.school_id if actor is not None else None
        if school_id is None:
            raise HTTPException(status_code=400, detail="School context is required to onboard student")

        student_role = self.role_repo.get_by_name(db, STUDENT, school_id=school_id)
        if not student_role:
            student_role = self.role_repo.get_by_name_and_scope(db, STUDENT, "GLOBAL", None)
        if not student_role:
            raise HTTPException(status_code=500, detail="Student role is not configured")

        required_role_ids = set(data.role_ids)
        required_role_ids.add(student_role.id)
        roles = self.role_repo.get_by_ids_for_scope(db, list(required_role_ids), school_id, is_super_admin=False)

        if len(roles) != len(required_role_ids):
            raise HTTPException(status_code=400, detail="One or more roles do not exist")

        user = User(
            uuid=str(uuid.uuid4()),
            first_name=data.first_name,
            last_name=data.last_name,
            email=str(data.email),
            username=data.username,
            hashed_password=hash_password(data.password),
            school_id=school_id,
            is_super_admin=False,
        )
        self._replace_user_roles(user, roles, school_id)

        try:
            db.add(user)
            db.flush()

            student = Student(user_id=user.id, school_id=school_id, **data.student.model_dump())
            db.add(student)

            db.commit()
            db.refresh(user)
            db.refresh(student)
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(status_code=400, detail="Unable to onboard student with provided data") from exc

        return {"user": user, "student": student}
