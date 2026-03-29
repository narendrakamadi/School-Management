import uuid
from datetime import date
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import text

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.attendance import Attendance
from app.models.department import Department
from app.models.exam import Exam
from app.models.fee import Fee
from app.models.mark import Mark
from app.models.menu import Menu
from app.models.parent import Parent
from app.models.payment import Payment
from app.models.permission import Permission
from app.models.role import Role
from app.models.school import School
from app.models.school_class import SchoolClass
from app.models.section import Section
from app.models.staff import Staff
from app.models.student import Student
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.models.teacher_assignment import TeacherAssignment
from app.models.user import User
from app.models.user_role import UserRole

DEFAULT_PERMISSION_MODULES = [
    "users",
    "roles",
    "permissions",
    "students",
    "teachers",
    "staff",
    "parents",
    "classes",
    "sections",
    "subjects",
    "departments",
    "teacher_assignments",
    "attendance",
    "exams",
    "marks",
    "fees",
    "payments",
    "menus",
    "role_menus",
    "schools",
]
DEFAULT_PERMISSION_ACTIONS = ["create", "read", "update", "delete"]


def truncate_all_tables(db):
    table_names = db.execute(
        text(
            """
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
              AND tablename <> 'alembic_version'
            """
        )
    ).scalars().all()

    if not table_names:
        return

    quoted_names = ", ".join(f'"{name}"' for name in table_names)
    db.execute(text(f"TRUNCATE TABLE {quoted_names} RESTART IDENTITY CASCADE"))
    db.commit()


def seed_permissions(db):
    permissions = []
    for module in DEFAULT_PERMISSION_MODULES:
        for action in DEFAULT_PERMISSION_ACTIONS:
            permissions.append(
                Permission(name=f"{action}_{module}", module=module, action=action)
            )

    db.add_all(permissions)
    db.flush()
    return permissions


def make_user(email, username, first_name, last_name, school_id, is_super_admin=False):
    return User(
        uuid=str(uuid.uuid4()),
        first_name=first_name,
        last_name=last_name,
        email=email,
        username=username,
        hashed_password=hash_password("Password@123"),
        school_id=school_id,
        is_super_admin=is_super_admin,
        is_active=True,
        is_verified=True,
    )


def link_role(db, user, role, school_id):
    db.add(UserRole(user_id=user.id, role_id=role.id, school_id=school_id))


def seed_data(db):
    permissions = seed_permissions(db)

    school = School(
        name="Springfield High School",
        code="SHS-001",
        email="contact@springfieldhigh.edu",
        phone="+1-555-0100",
        address="742 Evergreen Terrace",
        city="Springfield",
        state="Illinois",
        country="USA",
        status="active",
    )
    db.add(school)
    db.flush()

    role_specs = [
        ("superadmin", "Platform super administrator", "GLOBAL", None, True),
        ("admin", "Global administrator", "GLOBAL", None, True),
        ("admin", "School administrator", "SCHOOL", school.id, True),
        ("teacher", "Teacher role", "SCHOOL", school.id, True),
        ("student", "Student role", "SCHOOL", school.id, True),
        ("parent", "Parent role", "SCHOOL", school.id, True),
        ("staff", "Staff role", "SCHOOL", school.id, True),
    ]

    roles = {}
    for name, description, scope, school_id, is_system in role_specs:
        role = Role(
            name=name,
            description=description,
            scope=scope,
            school_id=school_id,
            is_system=is_system,
        )
        if name == "superadmin" and scope == "GLOBAL":
            role.permissions = permissions
        if name == "admin" and ((scope == "GLOBAL") or (scope == "SCHOOL")):
            role.permissions = permissions

        db.add(role)
        db.flush()
        roles[(name, scope)] = role

    super_admin = make_user(
        email="superadmin@platform.local",
        username="superadmin",
        first_name="Super",
        last_name="Admin",
        school_id=None,
        is_super_admin=True,
    )
    school_admin = make_user(
        email="admin@springfieldhigh.edu",
        username="schooladmin",
        first_name="School",
        last_name="Admin",
        school_id=school.id,
    )
    teacher_user = make_user(
        email="teacher1@springfieldhigh.edu",
        username="teacher1",
        first_name="Tom",
        last_name="Teacher",
        school_id=school.id,
    )
    parent_user = make_user(
        email="parent1@springfieldhigh.edu",
        username="parent1",
        first_name="Paula",
        last_name="Parent",
        school_id=school.id,
    )
    student_user = make_user(
        email="student1@springfieldhigh.edu",
        username="student1",
        first_name="Sam",
        last_name="Student",
        school_id=school.id,
    )
    staff_user = make_user(
        email="staff1@springfieldhigh.edu",
        username="staff1",
        first_name="Stella",
        last_name="Staff",
        school_id=school.id,
    )

    db.add_all([super_admin, school_admin, teacher_user, parent_user, student_user, staff_user])
    db.flush()

    link_role(db, super_admin, roles[("superadmin", "GLOBAL")], None)
    link_role(db, school_admin, roles[("admin", "SCHOOL")], school.id)
    link_role(db, teacher_user, roles[("teacher", "SCHOOL")], school.id)
    link_role(db, parent_user, roles[("parent", "SCHOOL")], school.id)
    link_role(db, student_user, roles[("student", "SCHOOL")], school.id)
    link_role(db, staff_user, roles[("staff", "SCHOOL")], school.id)

    department = Department(school_id=school.id, name="Science")
    school_class = SchoolClass(school_id=school.id, name="Grade 10")
    db.add_all([department, school_class])
    db.flush()

    section = Section(school_id=school.id, class_id=school_class.id, name="A")
    subject = Subject(school_id=school.id, name="Mathematics", code="MATH-101")
    db.add_all([section, subject])
    db.flush()

    parent = Parent(
        school_id=school.id,
        user_id=parent_user.id,
        occupation="Engineer",
        annual_income=75000,
        relation_type="Father",
        address="742 Evergreen Terrace",
    )
    db.add(parent)
    db.flush()

    teacher = Teacher(
        school_id=school.id,
        user_id=teacher_user.id,
        employee_id="T-1001",
        qualification="M.Ed",
        experience_years=6,
        department_id=department.id,
        joining_date=date(2021, 6, 1),
        salary=60000,
        status="active",
    )
    staff = Staff(
        school_id=school.id,
        user_id=staff_user.id,
        employee_id="S-2001",
        designation="Librarian",
        department_id=department.id,
        joining_date=date(2022, 1, 10),
        salary=35000,
        shift_timing="08:00-16:00",
        status="active",
    )
    db.add_all([teacher, staff])
    db.flush()

    student = Student(
        school_id=school.id,
        user_id=student_user.id,
        admission_number="ADM-3001",
        roll_number="10A-01",
        class_id=school_class.id,
        section_id=section.id,
        date_of_birth=date(2010, 5, 12),
        gender="male",
        admission_date=date(2024, 4, 5),
        academic_year="2025-2026",
        parent_id=parent.id,
        address="742 Evergreen Terrace",
        status="active",
    )
    db.add(student)
    db.flush()

    assignment = TeacherAssignment(
        school_id=school.id,
        teacher_id=teacher.id,
        class_id=school_class.id,
        section_id=section.id,
        subject_id=subject.id,
    )
    attendance = Attendance(
        school_id=school.id,
        student_id=student.id,
        date=date.today(),
        status="present",
    )
    exam = Exam(
        school_id=school.id,
        name="Midterm",
        exam_type="Term",
        start_date=date(2026, 3, 10),
        end_date=date(2026, 3, 15),
    )
    db.add_all([assignment, attendance, exam])
    db.flush()

    mark = Mark(
        school_id=school.id,
        student_id=student.id,
        subject_id=subject.id,
        exam_id=exam.id,
        marks_obtained=88,
        max_marks=100,
        grade="A",
    )
    fee = Fee(
        school_id=school.id,
        student_id=student.id,
        amount=1200,
        due_date=date(2026, 4, 30),
        status="pending",
    )
    db.add_all([mark, fee])
    db.flush()

    payment = Payment(
        school_id=school.id,
        fee_id=fee.id,
        amount_paid=600,
        payment_date=date.today(),
        payment_mode="card",
        transaction_id="TXN-9001",
    )
    menu = Menu(name="Dashboard", path="/dashboard", icon="home", order_index=1)
    db.add_all([payment, menu])

    db.commit()

    print("Database reset and dummy data seeded successfully.")
    print("Login credentials (password: Password@123):")
    print("- superadmin")
    print("- schooladmin")
    print("- teacher1")
    print("- parent1")
    print("- student1")
    print("- staff1")


def main():
    db = SessionLocal()
    try:
        truncate_all_tables(db)
        seed_data(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()

