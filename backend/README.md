# School Management API Backend

FastAPI backend for a School Management System with:

- JWT authentication
- logout with token revocation
- role-based access control (RBAC)
- permission-based access control (ACL)
- user-specific permission overrides
- academic, people, finance, and menu management modules

This README is intended to be enough for a new developer or tester to clone the project, configure it, run it, understand the architecture, and start using the API.

---

## 1. Features

### Authentication

- User registration via `POST /api/v1/users/`
- Login via `POST /api/v1/auth/login`
- Logout via `POST /api/v1/auth/logout`
- JWT access tokens with `sub`, `roles`, `permissions`, `exp`, and `jti`
- Revoked tokens are blocked after logout

### Access Control

- System roles: `superadmin`, `admin`, `teacher`, `student`, `parent`, `staff`
- Role permissions through `role_permissions`
- Direct user permission overrides through `user_permissions`
- Effective permission resolution supports:
  - inherited role permissions
  - direct user allow
  - direct user deny override
- `superadmin` bypasses role checks in the current RBAC dependency layer

### Domain Modules

- Users
- Roles
- Permissions
- Students
- Teachers
- Parents
- Staff
- Classes
- Sections
- Subjects
- Departments
- Teacher assignments
- Attendance
- Exams
- Marks
- Fees
- Payments
- Menus
- Role menus

---

## 2. Tech Stack

- Python 3
- FastAPI
- SQLAlchemy ORM
- Pydantic / pydantic-settings
- PyJWT
- pwdlib for password hashing

---

## 3. Environment Variables

The project reads configuration from `.env` using `app/core/config.py`.

Required variables:

```env
DB_CONNECTION=postgresql://postgres:password@localhost:5432/school_management
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Notes

- `DB_CONNECTION` should point to your PostgreSQL database.
- `SECRET_KEY` must be kept private.
- `ALGORITHM` is currently used by JWT encode/decode.
- `ACCESS_TOKEN_EXPIRE_MINUTES` controls access-token lifetime.

---

## 4. Installation and Run

### Create and activate a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Install dependencies

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# apply DB migrations
.venv/bin/alembic upgrade head
```

### Start the API

```bash
fastapi dev main.py --reload
```

If `fastapi` CLI is unavailable in your environment, you can also use Uvicorn if installed:

```bash
uvicorn main:app --reload
```

### API base URL

When running locally, the API base URL is typically:

```text
http://127.0.0.1:8000/api/v1
```

### API docs

FastAPI automatically exposes interactive docs:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## 5. Startup Behavior

When the application starts:

1. All SQLAlchemy models are imported from `app/models/__init__.py`
2. A lightweight compatibility patch may run for legacy schemas
3. If `AUTO_INIT_DB=true`, tables are created and seeded by `app/db/init_db.py`

### Recommended migration workflow (Alembic)

Use Alembic for all schema changes:

```bash
.venv/bin/alembic upgrade head
```

Create a new migration after model updates:

```bash
.venv/bin/alembic revision --autogenerate -m "describe_change"
```

Rollback one migration:

```bash
.venv/bin/alembic downgrade -1
```

### Seeded roles

- `superadmin`
- `admin`
- `teacher`
- `student`
- `parent`
- `staff`

### Seeded permission modules

The app seeds `create`, `read`, `update`, `delete` permissions for:

- `users`
- `roles`
- `permissions`
- `students`
- `teachers`
- `staff`
- `parents`
- `classes`
- `sections`
- `subjects`
- `departments`
- `teacher_assignments`
- `attendance`
- `exams`
- `marks`
- `fees`
- `payments`
- `menus`
- `role_menus`

Example seeded permission names:

- `create_students`
- `read_teachers`
- `update_fees`
- `delete_menus`

### Default elevated access

On startup, both `superadmin` and `admin` are assigned all seeded permissions.

---

## 6. Authentication Flow

### Register a user

The project currently supports user creation via:

`POST /api/v1/users/`

Example:

```json
{
  "first_name": "System",
  "last_name": "Admin",
  "email": "admin@school.com",
  "username": "admin",
  "password": "Admin@123",
  "role_ids": [1]
}
```

> Important: the current `users` endpoint is not protected in code. For a production setup, you should lock this endpoint down or split public signup from admin user creation.

### Login

Endpoint:

`POST /api/v1/auth/login`

Request body:

```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

Response shape:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "roles": ["admin"],
  "permissions": ["create_users", "read_users"]
}
```

### Use the token

Pass the token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Logout

Endpoint:

`POST /api/v1/auth/logout`

This revokes the current JWT by storing its `jti` in the `revoked_tokens` table. Any protected endpoint using that token will reject it afterward.

---

## 7. RBAC and ACL Design

### Tables involved

- `users`
- `roles`
- `user_roles`
- `permissions`
- `role_permissions`
- `user_permissions`
- `revoked_tokens`

### Role checks

Role checks are enforced via helpers in `app/rbac/dependencies.py`:

- `require_roles(...)`

Example usage in routes:

- role endpoints require `admin`

### Permission checks

Permission checks are enforced with:

- `require_permission(...)`
- `require_any_permission(...)`

Most domain endpoints currently use `require_any_permission(...)`.

### Effective permission calculation

Permissions are computed from:

1. role permissions
2. user permission overrides

Current behavior:

- role permissions grant access
- user-level `is_allowed = true` grants access directly
- user-level `is_allowed = false` removes that permission even if inherited from a role

---

## 8. API Route Overview

All routes are mounted under:

```text
/api/v1
```

### Auth

- `POST /auth/login`
- `POST /auth/logout`

### Users

- `POST /users/`

### Roles

- `POST /roles/`
- `GET /roles/`

### Permissions

- `POST /permissions/`
- `GET /permissions/`
- `PUT /permissions/roles/{role_id}`
- `GET /permissions/roles/{role_id}`
- `PUT /permissions/users/{user_id}`
- `GET /permissions/users/{user_id}`
- `GET /permissions/users/{user_id}/effective`
- `GET /permissions/me/effective`

### People

#### Students

- `POST /students`
- `GET /students`
- `GET /students/{student_id}`
- `DELETE /students/{student_id}`

#### Teachers

- `POST /teachers`
- `GET /teachers`
- `GET /teachers/{teacher_id}`
- `DELETE /teachers/{teacher_id}`

#### Parents

- `POST /parents`
- `GET /parents`
- `GET /parents/{parent_id}`
- `DELETE /parents/{parent_id}`

#### Staff

- `POST /staff`
- `GET /staff`
- `GET /staff/{staff_id}`
- `DELETE /staff/{staff_id}`

### Academics

#### Classes

- `POST /classes`
- `GET /classes`
- `GET /classes/{class_id}`
- `DELETE /classes/{class_id}`

#### Sections

- `POST /sections`
- `GET /sections`
- `GET /sections/{section_id}`
- `DELETE /sections/{section_id}`

#### Subjects

- `POST /subjects`
- `GET /subjects`
- `GET /subjects/{subject_id}`
- `DELETE /subjects/{subject_id}`

#### Departments

- `POST /departments`
- `GET /departments`
- `GET /departments/{department_id}`
- `DELETE /departments/{department_id}`

#### Teacher Assignments

- `POST /teacher-assignments`
- `GET /teacher-assignments`
- `GET /teacher-assignments/{assignment_id}`
- `DELETE /teacher-assignments/{assignment_id}`

#### Attendance

- `POST /attendance`
- `GET /attendance`
- `GET /attendance/{attendance_id}`
- `DELETE /attendance/{attendance_id}`

#### Exams

- `POST /exams`
- `GET /exams`
- `GET /exams/{exam_id}`
- `DELETE /exams/{exam_id}`

#### Marks

- `POST /marks`
- `GET /marks`
- `GET /marks/{mark_id}`
- `DELETE /marks/{mark_id}`

### Finance

#### Fees

- `POST /fees`
- `GET /fees`
- `GET /fees/{fee_id}`
- `DELETE /fees/{fee_id}`

#### Payments

- `POST /payments`
- `GET /payments`
- `GET /payments/{payment_id}`
- `DELETE /payments/{payment_id}`

### Menus

- `POST /menus`
- `GET /menus`
- `GET /menus/{menu_id}`
- `DELETE /menus/{menu_id}`
- `PUT /role-menus/{role_id}`
- `GET /role-menus/{role_id}`

---

## 9. Example Usage Sequence

Below is a sensible order for testing the system manually.

### Step 1: Start the application

```bash
fastapi dev main.py --reload
```

### Step 2: Create an initial user

```http
POST /api/v1/users/
```

```json
{
  "first_name": "Super",
  "last_name": "Admin",
  "email": "superadmin@school.com",
  "username": "superadmin",
  "password": "SuperAdmin@123",
  "role_ids": [1]
}
```

### Step 3: Login

```http
POST /api/v1/auth/login
```

```json
{
  "username": "superadmin",
  "password": "SuperAdmin@123"
}
```

### Step 4: Create roles or inspect seeded roles

```http
GET /api/v1/roles/
Authorization: Bearer <token>
```

### Step 5: Create or review permissions

```http
GET /api/v1/permissions/
Authorization: Bearer <token>
```

### Step 6: Assign role permissions or user overrides

Examples:

- `PUT /api/v1/permissions/roles/{role_id}`
- `PUT /api/v1/permissions/users/{user_id}`

### Step 7: Create master data

Recommended order:

1. departments
2. classes
3. sections
4. subjects
5. menus

### Step 8: Create people records

Recommended order:

1. parents
2. teachers
3. staff
4. students

### Step 9: Create operational records

Recommended order:

1. teacher assignments
2. attendance
3. exams
4. marks
5. fees
6. payments

---

## 10. Example JSON Payloads

### Create a role

```json
{
  "name": "accountant",
  "description": "Finance office role",
  "is_system": false
}
```

### Create a permission

```json
{
  "module": "fees",
  "action": "create"
}
```

If `name` is omitted, the API generates a name like `create_fees`.

### Assign permissions to a role

```json
{
  "permission_ids": [1, 2, 3]
}
```

### Assign permission overrides to a user

```json
{
  "permissions": [
	{
	  "permission_id": 1,
	  "is_allowed": true
	},
	{
	  "permission_id": 2,
	  "is_allowed": false
	}
  ]
}
```

### Create a student

```json
{
  "user_id": 10,
  "admission_number": "ADM-0001",
  "roll_number": "R-01",
  "class_id": 1,
  "section_id": 1,
  "date_of_birth": "2010-04-10",
  "gender": "male",
  "admission_date": "2026-01-10",
  "academic_year": "2026/2027",
  "parent_id": 1,
  "address": "Lagos",
  "status": "active"
}
```

### Create a teacher assignment

```json
{
  "teacher_id": 1,
  "class_id": 1,
  "section_id": 1,
  "subject_id": 1
}
```

### Create attendance

```json
{
  "student_id": 1,
  "date": "2026-03-28",
  "status": "present"
}
```

### Create an exam

```json
{
  "name": "Mid Term",
  "exam_type": "term",
  "start_date": "2026-03-01",
  "end_date": "2026-03-05"
}
```

### Create marks

```json
{
  "student_id": 1,
  "subject_id": 1,
  "exam_id": 1,
  "marks_obtained": 85,
  "max_marks": 100,
  "grade": "A"
}
```

### Create a fee

```json
{
  "student_id": 1,
  "amount": 50000,
  "due_date": "2026-04-30",
  "status": "pending"
}
```

### Create a payment

```json
{
  "fee_id": 1,
  "amount_paid": 25000,
  "payment_date": "2026-03-28",
  "payment_mode": "transfer",
  "transaction_id": "TXN-0001"
}
```

### Create a menu

```json
{
  "name": "Dashboard",
  "path": "/dashboard",
  "icon": "home",
  "parent_id": null,
  "order_index": 1
}
```

### Assign menus to a role

```json
{
  "menu_ids": [1, 2, 3]
}
```

---

## 11. Project Structure

```text
backend/
├── main.py
├── README.md
├── requirements.txt
├── table_schema.txt
├── tests/
│   └── smoke_runner.py
└── app/
	├── api/v1/endpoints/
	├── core/
	├── db/
	├── middleware/
	├── models/
	├── rbac/
	├── repositories/
	├── schemas/
	├── services/
	└── utils/
```

### Important packages

- `app/core/` – configuration, JWT, auth dependencies
- `app/db/` – base model, database session, startup seeding
- `app/models/` – SQLAlchemy models
- `app/schemas/` – request/response Pydantic schemas
- `app/repositories/` – data access layer
- `app/services/` – business logic layer
- `app/rbac/` – roles, permissions, and dependency guards
- `app/api/v1/endpoints/` – FastAPI route handlers

---

## 12. Quick Smoke Check

There is a lightweight smoke harness in `tests/smoke_runner.py`.

Run:

```bash
python3 tests/smoke_runner.py
```

If your environment is missing dependencies, install them first using `requirements.txt`.

---

## 13. Current Implementation Notes

This project is functional, but there are a few important things to know.

### Currently implemented

- create/list/get/delete flows for most domain modules
- role and permission assignment
- role-menu assignment
- login/logout with JWT revocation
- effective permission lookup

### Current limitations

- many domain modules do not yet expose `PUT/PATCH` update endpoints
- `POST /api/v1/users/` is not currently protected
- table creation is handled with `create_all()` instead of migrations
- seeded roles and permissions exist, but seeded demo users are not created by default

### Suggested next improvements

- protect or redesign the user registration endpoint
- add update endpoints for people, academics, finance, and menus
- add pagination/filtering for list endpoints
- add database migrations with Alembic
- add automated tests for auth and RBAC flows
- add seeded demo users with known credentials for development

---

## 14. Troubleshooting

### Invalid credentials on login

Make sure:

- the user exists in `users`
- the stored password was created through the app's hashing flow
- you are using the correct `username`

### Token works before logout but fails after logout

That is expected. Logged-out tokens are revoked and blocked by `get_current_user()`.

### Foreign key error when truncating tables

Use:

```sql
TRUNCATE TABLE
    role_menus,
    payments,
    fees,
    marks,
    attendance,
    teacher_assignments,
    students,
    teachers,
    staff,
    parents,
    user_permissions,
    role_permissions,
    user_roles,
    menus,
    exams,
    sections,
    classes,
    subjects,
    departments,
    permissions,
    roles,
    users
RESTART IDENTITY CASCADE;
```

Or truncate all related tables together when resetting development data.

### Missing package/module errors

Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

---

## 15. Dependency List

Current dependencies in `requirements.txt`:

- `fastapi`
- `uvicorn`
- `sqlalchemy`
- `pydantic[email]`
- `pydantic-settings`
- `pwdlib`
- `PyJWT`

---

## 16. Useful References

- Database design reference: `table_schema.txt`
- App entry point: `main.py`
- Router registration: `app/api/v1/router.py`
- Startup seeding: `app/db/init_db.py`
- Auth service: `app/services/auth_service.py`
- RBAC dependencies: `app/rbac/dependencies.py`

---

## 17. Summary

This backend is a solid foundation for a multi-role school management system.
It already includes authentication, permission-aware access control, and a broad set of school-related modules. The next phase is mostly about hardening and refinement: protecting public endpoints, adding update flows, adopting migrations, and adding automated tests.
