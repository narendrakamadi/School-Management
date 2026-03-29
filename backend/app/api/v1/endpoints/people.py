from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_with_school_context
from app.db.session import get_db
from app.models.parent import Parent
from app.models.staff import Staff
from app.models.student import Student
from app.models.teacher import Teacher
from app.rbac.dependencies import require_any_permission, require_roles
from app.rbac.roles import ADMIN, SUPERADMIN
from app.schemas.common import DeleteResponse
from app.schemas.people import (
    ParentCreate,
    ParentOut,
    StaffCreate,
    StaffOut,
    StudentCreate,
    StudentOnboardCreate,
    StudentOnboardOut,
    StudentOut,
    TeacherCreate,
    TeacherOut,
)
from app.services.generic_service import GenericService
from app.services.user_service import UserService

router = APIRouter()

student_service = GenericService(Student, "Student not found")
teacher_service = GenericService(Teacher, "Teacher not found")
parent_service = GenericService(Parent, "Parent not found")
staff_service = GenericService(Staff, "Staff not found")
user_service = UserService()


@router.post(
    "/students/onboard",
    response_model=StudentOnboardOut,
    dependencies=[Depends(require_roles(ADMIN, SUPERADMIN))],
)
def onboard_student(
    data: StudentOnboardCreate,
    db: Session = Depends(get_db),
    context=Depends(get_current_user_with_school_context),
):
    return user_service.onboard_student(db, data, actor=context.user)


@router.post("/students", response_model=StudentOut, dependencies=[Depends(require_any_permission("create_students"))])
def create_student(data: StudentCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return student_service.create(db, data, current_user=context.user)


@router.get("/students", response_model=list[StudentOut], dependencies=[Depends(require_any_permission("read_students"))])
def list_students(db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return student_service.list_all(db, current_user=context.user)


@router.get("/students/{student_id}", response_model=StudentOut, dependencies=[Depends(require_any_permission("read_students"))])
def get_student(student_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return student_service.get(db, student_id, current_user=context.user)


@router.put("/students/{student_id}", response_model=StudentOut, dependencies=[Depends(require_any_permission("update_students"))])
def update_student(student_id: int, data: StudentCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return student_service.update(db, student_id, data, current_user=context.user)


@router.delete("/students/{student_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_students"))])
def delete_student(student_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return student_service.delete(db, student_id, current_user=context.user)


@router.post("/teachers", response_model=TeacherOut, dependencies=[Depends(require_any_permission("create_teachers"))])
def create_teacher(data: TeacherCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return teacher_service.create(db, data, current_user=context.user)


@router.get("/teachers", response_model=list[TeacherOut], dependencies=[Depends(require_any_permission("read_teachers"))])
def list_teachers(db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return teacher_service.list_all(db, current_user=context.user)


@router.get("/teachers/{teacher_id}", response_model=TeacherOut, dependencies=[Depends(require_any_permission("read_teachers"))])
def get_teacher(teacher_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return teacher_service.get(db, teacher_id, current_user=context.user)


@router.put("/teachers/{teacher_id}", response_model=TeacherOut, dependencies=[Depends(require_any_permission("update_teachers"))])
def update_teacher(teacher_id: int, data: TeacherCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return teacher_service.update(db, teacher_id, data, current_user=context.user)


@router.delete("/teachers/{teacher_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_teachers"))])
def delete_teacher(teacher_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return teacher_service.delete(db, teacher_id, current_user=context.user)


@router.post("/parents", response_model=ParentOut, dependencies=[Depends(require_any_permission("create_parents"))])
def create_parent(data: ParentCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return parent_service.create(db, data, current_user=context.user)


@router.get("/parents", response_model=list[ParentOut], dependencies=[Depends(require_any_permission("read_parents"))])
def list_parents(db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return parent_service.list_all(db, current_user=context.user)


@router.get("/parents/{parent_id}", response_model=ParentOut, dependencies=[Depends(require_any_permission("read_parents"))])
def get_parent(parent_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return parent_service.get(db, parent_id, current_user=context.user)


@router.put("/parents/{parent_id}", response_model=ParentOut, dependencies=[Depends(require_any_permission("update_parents"))])
def update_parent(parent_id: int, data: ParentCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return parent_service.update(db, parent_id, data, current_user=context.user)


@router.delete("/parents/{parent_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_parents"))])
def delete_parent(parent_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return parent_service.delete(db, parent_id, current_user=context.user)


@router.post("/staff", response_model=StaffOut, dependencies=[Depends(require_any_permission("create_staff"))])
def create_staff_member(data: StaffCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return staff_service.create(db, data, current_user=context.user)


@router.get("/staff", response_model=list[StaffOut], dependencies=[Depends(require_any_permission("read_staff"))])
def list_staff_members(db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return staff_service.list_all(db, current_user=context.user)


@router.get("/staff/{staff_id}", response_model=StaffOut, dependencies=[Depends(require_any_permission("read_staff"))])
def get_staff_member(staff_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return staff_service.get(db, staff_id, current_user=context.user)


@router.put("/staff/{staff_id}", response_model=StaffOut, dependencies=[Depends(require_any_permission("update_staff"))])
def update_staff_member(staff_id: int, data: StaffCreate, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return staff_service.update(db, staff_id, data, current_user=context.user)


@router.delete("/staff/{staff_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_staff"))])
def delete_staff_member(staff_id: int, db: Session = Depends(get_db), context=Depends(get_current_user_with_school_context)):
    return staff_service.delete(db, staff_id, current_user=context.user)

