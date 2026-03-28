from datetime import date

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserOut


class ParentBase(BaseModel):
    user_id: int
    occupation: str | None = None
    annual_income: int | None = None
    relation_type: str | None = None
    address: str | None = None


class ParentCreate(ParentBase):
    pass


class ParentOut(ParentBase):
    id: int

    class Config:
        from_attributes = True


class TeacherBase(BaseModel):
    user_id: int
    employee_id: str | None = None
    qualification: str | None = None
    experience_years: int | None = None
    department_id: int | None = None
    joining_date: date | None = None
    salary: int | None = None
    status: str | None = None


class TeacherCreate(TeacherBase):
    pass


class TeacherOut(TeacherBase):
    id: int

    class Config:
        from_attributes = True


class StaffBase(BaseModel):
    user_id: int
    employee_id: str | None = None
    designation: str | None = None
    department_id: int | None = None
    joining_date: date | None = None
    salary: int | None = None
    shift_timing: str | None = None
    status: str | None = None


class StaffCreate(StaffBase):
    pass


class StaffOut(StaffBase):
    id: int

    class Config:
        from_attributes = True


class StudentBase(BaseModel):
    user_id: int
    admission_number: str | None = None
    roll_number: str | None = None
    class_id: int | None = None
    section_id: int | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    admission_date: date | None = None
    academic_year: str | None = None
    parent_id: int | None = None
    address: str | None = None
    status: str | None = None


class StudentCreate(StudentBase):
    pass


class StudentOut(StudentBase):
    id: int

    class Config:
        from_attributes = True


class StudentProfileCreate(BaseModel):
    admission_number: str | None = None
    roll_number: str | None = None
    class_id: int | None = None
    section_id: int | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    admission_date: date | None = None
    academic_year: str | None = None
    parent_id: int | None = None
    address: str | None = None
    status: str | None = None


class StudentOnboardCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    password: str
    role_ids: list[int] = Field(default_factory=list)
    student: StudentProfileCreate


class StudentOnboardOut(BaseModel):
    user: UserOut
    student: StudentOut


