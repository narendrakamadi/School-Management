from datetime import date

from pydantic import BaseModel


class ClassBase(BaseModel):
    name: str


class ClassCreate(ClassBase):
    pass


class ClassOut(ClassBase):
    id: int

    class Config:
        from_attributes = True


class SectionBase(BaseModel):
    class_id: int
    name: str


class SectionCreate(SectionBase):
    pass


class SectionOut(SectionBase):
    id: int

    class Config:
        from_attributes = True


class SubjectBase(BaseModel):
    name: str
    code: str | None = None


class SubjectCreate(SubjectBase):
    pass


class SubjectOut(SubjectBase):
    id: int

    class Config:
        from_attributes = True


class DepartmentBase(BaseModel):
    name: str


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentOut(DepartmentBase):
    id: int

    class Config:
        from_attributes = True


class TeacherAssignmentBase(BaseModel):
    teacher_id: int
    class_id: int
    section_id: int
    subject_id: int


class TeacherAssignmentCreate(TeacherAssignmentBase):
    pass


class TeacherAssignmentOut(TeacherAssignmentBase):
    id: int

    class Config:
        from_attributes = True


class AttendanceBase(BaseModel):
    student_id: int
    date: date
    status: str


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceOut(AttendanceBase):
    id: int

    class Config:
        from_attributes = True


class ExamBase(BaseModel):
    name: str
    exam_type: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class ExamCreate(ExamBase):
    pass


class ExamOut(ExamBase):
    id: int

    class Config:
        from_attributes = True


class MarkBase(BaseModel):
    student_id: int
    subject_id: int
    exam_id: int
    marks_obtained: int | None = None
    max_marks: int | None = None
    grade: str | None = None


class MarkCreate(MarkBase):
    pass


class MarkOut(MarkBase):
    id: int

    class Config:
        from_attributes = True

