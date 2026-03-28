from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.attendance import Attendance
from app.models.department import Department
from app.models.exam import Exam
from app.models.mark import Mark
from app.models.school_class import SchoolClass
from app.models.section import Section
from app.models.subject import Subject
from app.models.teacher_assignment import TeacherAssignment
from app.rbac.dependencies import require_any_permission
from app.schemas.academics import (
    AttendanceCreate,
    AttendanceOut,
    ClassCreate,
    ClassOut,
    DepartmentCreate,
    DepartmentOut,
    ExamCreate,
    ExamOut,
    MarkCreate,
    MarkOut,
    SectionCreate,
    SectionOut,
    SubjectCreate,
    SubjectOut,
    TeacherAssignmentCreate,
    TeacherAssignmentOut,
)
from app.schemas.common import DeleteResponse
from app.services.generic_service import GenericService

router = APIRouter()

class_service = GenericService(SchoolClass, "Class not found")
section_service = GenericService(Section, "Section not found")
subject_service = GenericService(Subject, "Subject not found")
department_service = GenericService(Department, "Department not found")
teacher_assignment_service = GenericService(TeacherAssignment, "Teacher assignment not found")
attendance_service = GenericService(Attendance, "Attendance not found")
exam_service = GenericService(Exam, "Exam not found")
mark_service = GenericService(Mark, "Mark not found")


@router.post("/classes", response_model=ClassOut, dependencies=[Depends(require_any_permission("create_classes"))])
def create_class(data: ClassCreate, db: Session = Depends(get_db)):
    return class_service.create(db, data)


@router.get("/classes", response_model=list[ClassOut], dependencies=[Depends(require_any_permission("read_classes"))])
def list_classes(db: Session = Depends(get_db)):
    return class_service.list_all(db)


@router.get("/classes/{class_id}", response_model=ClassOut, dependencies=[Depends(require_any_permission("read_classes"))])
def get_class(class_id: int, db: Session = Depends(get_db)):
    return class_service.get(db, class_id)


@router.delete("/classes/{class_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_classes"))])
def delete_class(class_id: int, db: Session = Depends(get_db)):
    return class_service.delete(db, class_id)


@router.post("/sections", response_model=SectionOut, dependencies=[Depends(require_any_permission("create_sections"))])
def create_section(data: SectionCreate, db: Session = Depends(get_db)):
    return section_service.create(db, data)


@router.get("/sections", response_model=list[SectionOut], dependencies=[Depends(require_any_permission("read_sections"))])
def list_sections(db: Session = Depends(get_db)):
    return section_service.list_all(db)


@router.get("/sections/{section_id}", response_model=SectionOut, dependencies=[Depends(require_any_permission("read_sections"))])
def get_section(section_id: int, db: Session = Depends(get_db)):
    return section_service.get(db, section_id)


@router.delete("/sections/{section_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_sections"))])
def delete_section(section_id: int, db: Session = Depends(get_db)):
    return section_service.delete(db, section_id)


@router.post("/subjects", response_model=SubjectOut, dependencies=[Depends(require_any_permission("create_subjects"))])
def create_subject(data: SubjectCreate, db: Session = Depends(get_db)):
    return subject_service.create(db, data)


@router.get("/subjects", response_model=list[SubjectOut], dependencies=[Depends(require_any_permission("read_subjects"))])
def list_subjects(db: Session = Depends(get_db)):
    return subject_service.list_all(db)


@router.get("/subjects/{subject_id}", response_model=SubjectOut, dependencies=[Depends(require_any_permission("read_subjects"))])
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    return subject_service.get(db, subject_id)


@router.delete("/subjects/{subject_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_subjects"))])
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    return subject_service.delete(db, subject_id)


@router.post("/departments", response_model=DepartmentOut, dependencies=[Depends(require_any_permission("create_departments"))])
def create_department(data: DepartmentCreate, db: Session = Depends(get_db)):
    return department_service.create(db, data)


@router.get("/departments", response_model=list[DepartmentOut], dependencies=[Depends(require_any_permission("read_departments"))])
def list_departments(db: Session = Depends(get_db)):
    return department_service.list_all(db)


@router.get("/departments/{department_id}", response_model=DepartmentOut, dependencies=[Depends(require_any_permission("read_departments"))])
def get_department(department_id: int, db: Session = Depends(get_db)):
    return department_service.get(db, department_id)


@router.delete("/departments/{department_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_departments"))])
def delete_department(department_id: int, db: Session = Depends(get_db)):
    return department_service.delete(db, department_id)


@router.post("/teacher-assignments", response_model=TeacherAssignmentOut, dependencies=[Depends(require_any_permission("create_teacher_assignments"))])
def create_teacher_assignment(data: TeacherAssignmentCreate, db: Session = Depends(get_db)):
    return teacher_assignment_service.create(db, data)


@router.get("/teacher-assignments", response_model=list[TeacherAssignmentOut], dependencies=[Depends(require_any_permission("read_teacher_assignments"))])
def list_teacher_assignments(db: Session = Depends(get_db)):
    return teacher_assignment_service.list_all(db)


@router.get("/teacher-assignments/{assignment_id}", response_model=TeacherAssignmentOut, dependencies=[Depends(require_any_permission("read_teacher_assignments"))])
def get_teacher_assignment(assignment_id: int, db: Session = Depends(get_db)):
    return teacher_assignment_service.get(db, assignment_id)


@router.delete("/teacher-assignments/{assignment_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_teacher_assignments"))])
def delete_teacher_assignment(assignment_id: int, db: Session = Depends(get_db)):
    return teacher_assignment_service.delete(db, assignment_id)


@router.post("/attendance", response_model=AttendanceOut, dependencies=[Depends(require_any_permission("create_attendance"))])
def create_attendance(data: AttendanceCreate, db: Session = Depends(get_db)):
    return attendance_service.create(db, data)


@router.get("/attendance", response_model=list[AttendanceOut], dependencies=[Depends(require_any_permission("read_attendance"))])
def list_attendance(db: Session = Depends(get_db)):
    return attendance_service.list_all(db)


@router.get("/attendance/{attendance_id}", response_model=AttendanceOut, dependencies=[Depends(require_any_permission("read_attendance"))])
def get_attendance(attendance_id: int, db: Session = Depends(get_db)):
    return attendance_service.get(db, attendance_id)


@router.delete("/attendance/{attendance_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_attendance"))])
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    return attendance_service.delete(db, attendance_id)


@router.post("/exams", response_model=ExamOut, dependencies=[Depends(require_any_permission("create_exams"))])
def create_exam(data: ExamCreate, db: Session = Depends(get_db)):
    return exam_service.create(db, data)


@router.get("/exams", response_model=list[ExamOut], dependencies=[Depends(require_any_permission("read_exams"))])
def list_exams(db: Session = Depends(get_db)):
    return exam_service.list_all(db)


@router.get("/exams/{exam_id}", response_model=ExamOut, dependencies=[Depends(require_any_permission("read_exams"))])
def get_exam(exam_id: int, db: Session = Depends(get_db)):
    return exam_service.get(db, exam_id)


@router.delete("/exams/{exam_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_exams"))])
def delete_exam(exam_id: int, db: Session = Depends(get_db)):
    return exam_service.delete(db, exam_id)


@router.post("/marks", response_model=MarkOut, dependencies=[Depends(require_any_permission("create_marks"))])
def create_mark(data: MarkCreate, db: Session = Depends(get_db)):
    return mark_service.create(db, data)


@router.get("/marks", response_model=list[MarkOut], dependencies=[Depends(require_any_permission("read_marks"))])
def list_marks(db: Session = Depends(get_db)):
    return mark_service.list_all(db)


@router.get("/marks/{mark_id}", response_model=MarkOut, dependencies=[Depends(require_any_permission("read_marks"))])
def get_mark(mark_id: int, db: Session = Depends(get_db)):
    return mark_service.get(db, mark_id)


@router.delete("/marks/{mark_id}", response_model=DeleteResponse, dependencies=[Depends(require_any_permission("delete_marks"))])
def delete_mark(mark_id: int, db: Session = Depends(get_db)):
    return mark_service.delete(db, mark_id)

