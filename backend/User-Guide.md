# User Guide

Practical guide to operate the School Management API end-to-end in a multi-tenant setup.

## 1) Base URL and Auth Header

- Base URL: `http://127.0.0.1:8000/api/v1`
- Protected endpoints require:

```http
Authorization: Bearer <access_token>
```

## 2) Reset and Seed (Optional but Recommended for Fresh Start)

### Quick Wipe and Reinstall Everything

Use this if you want a complete fresh start with clean demo data. This command truncates all tables and reseeds dummy data in one go:

```bash
cd '/Users/ndkamadi/Documents/Projects/Learning/Practice Projects/school-management/backend' && . .venv/bin/activate && python scripts/reset_and_seed_dummy_data.py
```

### Manual Reset and Seed

Alternatively, use this if you want clean demo data before testing new schools/users:

```bash
cd '/Users/ndkamadi/Documents/Projects/Learning/Practice Projects/school-management/backend'
. .venv/bin/activate
python scripts/reset_and_seed_dummy_data.py
```

### Seeded Login Users

After reset, the following demo users are available (password: `Password@123`):
- `superadmin` (super admin - can create schools and users)
- `schooladmin` (school admin for seeded school)
- `teacher1` (teacher for seeded school)
- `parent1` (parent for seeded school)
- `student1` (student for seeded school)
- `staff1` (staff for seeded school)

## 3) Bootstrap User (Fresh Database Only)

### What It Is

`POST /users/bootstrap` is the **only endpoint that requires no authentication**. It exists to solve the chicken-and-egg problem on a brand new database:

- Every other endpoint requires a JWT token
- To get a token you need to login
- To login you need a user
- To create a user you need a token

Bootstrap breaks this loop by letting you create the **very first super admin user** without any token.

### Rules

- Works **only when the database has zero users** — returns `403 Forbidden` permanently after the first user exists
- Always forces `is_super_admin: true` and `school_id: null` regardless of what you send in the body
- No role is required to call it

### When to Use

Use this only once, immediately after:
- A fresh database setup, OR
- Running `reset_and_seed_dummy_data.py` clears all users (the seed script creates `superadmin` for you, so bootstrap is not needed after seeding)

### Usage

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/users/bootstrap \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name": "Super",
    "last_name": "Admin",
    "email": "superadmin@platform.local",
    "username": "superadmin",
    "password": "Password@123",
    "role_ids": [],
    "is_super_admin": true
  }'
```

After this call, login normally with `POST /auth/login` to get your token, then proceed to create schools and users.

> **Note:** After the seed script is run, `superadmin` already exists so this endpoint is disabled. Use it only on a truly empty database.

---

## 4) Login / Logout / Password Reset

### Login

- **POST** `/auth/login`

```json
{
  "username": "superadmin",
  "password": "Password@123"
}
```

### Logout

- **POST** `/auth/logout`

### Forgot Password

- **POST** `/auth/forgot-password`

```json
{
  "email": "admin@school.com"
}
```

### Reset Password

- **POST** `/auth/reset-password`

```json
{
  "token": "<reset-token>",
  "new_password": "NewPassword@123"
}
```

## 5) End-to-End: Create School and Users (Admin/Teacher/Student/Parent/Staff)

This is the safest order to avoid permission mismatch.

### Step A: Login as Super Admin

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"superadmin","password":"Password@123"}'
```

Store token in shell variable:

```bash
SUPER_TOKEN='<paste_access_token_here>'
```

### Step B: Create a School

- **POST** `/schools` (requires `superadmin` role)

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/schools \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Green Valley School",
    "code":"GVS-001",
    "email":"info@gvs.edu",
    "phone":"+1-555-1000",
    "address":"Main Street",
    "city":"Springfield",
    "state":"IL",
    "country":"USA",
    "status":"active"
  }'
```

> Creating a school auto-creates school-scoped roles: `admin`, `teacher`, `student`, `parent`, `staff`.

### Step C: Find Role IDs for That School

- **GET** `/roles/`

```bash
curl -s http://127.0.0.1:8000/api/v1/roles/ \
  -H "Authorization: Bearer $SUPER_TOKEN"
```

Capture IDs for the new school:
- `SCHOOL_ID`
- `ADMIN_ROLE_ID`
- `TEACHER_ROLE_ID`
- `STUDENT_ROLE_ID`
- `PARENT_ROLE_ID`
- `STAFF_ROLE_ID`

Set them as shell variables before continuing:

```bash
SCHOOL_ID=2
ADMIN_ROLE_ID=8
TEACHER_ROLE_ID=9
STUDENT_ROLE_ID=10
PARENT_ROLE_ID=11
STAFF_ROLE_ID=12
```

### Step D: Assign Role Permissions

- **GET** `/permissions/` to list permission IDs
- **PUT** `/permissions/roles/{role_id}` to assign IDs

```bash
curl -s http://127.0.0.1:8000/api/v1/permissions/ \
  -H "Authorization: Bearer $SUPER_TOKEN"
```

Example: assign teacher permissions.

```bash
curl -s -X PUT http://127.0.0.1:8000/api/v1/permissions/roles/$TEACHER_ROLE_ID \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"permission_ids":[1,2,3]}'
```

Example: assign staff permissions.

```bash
curl -s -X PUT http://127.0.0.1:8000/api/v1/permissions/roles/$STAFF_ROLE_ID \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"permission_ids":[2,6,10]}'
```

Check role permissions:

- **GET** `/permissions/roles/{role_id}`

```bash
curl -s http://127.0.0.1:8000/api/v1/permissions/roles/$TEACHER_ROLE_ID \
  -H "Authorization: Bearer $SUPER_TOKEN"
```

### Step E: Create Users and Assign School Roles

- **POST** `/users/`
- Required body fields: `first_name`, `last_name`, `email`, `username`, `password`, `role_ids`, `school_id`, `is_super_admin`

Create school admin:

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/users/ \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"first_name\":\"School\",\"last_name\":\"Admin\",\"email\":\"admin@gvs.edu\",\"username\":\"gvs_admin\",\"password\":\"Password@123\",\"role_ids\":[$ADMIN_ROLE_ID],\"school_id\":$SCHOOL_ID,\"is_super_admin\":false}"
```

Create teacher user:

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/users/ \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"first_name\":\"Tina\",\"last_name\":\"Teacher\",\"email\":\"teacher@gvs.edu\",\"username\":\"gvs_teacher\",\"password\":\"Password@123\",\"role_ids\":[$TEACHER_ROLE_ID],\"school_id\":$SCHOOL_ID,\"is_super_admin\":false}"
```

Create student user:

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/users/ \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"first_name\":\"Sam\",\"last_name\":\"Student\",\"email\":\"student@gvs.edu\",\"username\":\"gvs_student\",\"password\":\"Password@123\",\"role_ids\":[$STUDENT_ROLE_ID],\"school_id\":$SCHOOL_ID,\"is_super_admin\":false}"
```

Create parent user:

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/users/ \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"first_name\":\"Paula\",\"last_name\":\"Parent\",\"email\":\"parent@gvs.edu\",\"username\":\"gvs_parent\",\"password\":\"Password@123\",\"role_ids\":[$PARENT_ROLE_ID],\"school_id\":$SCHOOL_ID,\"is_super_admin\":false}"
```

Create staff user:

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/users/ \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"first_name\":\"Stella\",\"last_name\":\"Staff\",\"email\":\"staff@gvs.edu\",\"username\":\"gvs_staff\",\"password\":\"Password@123\",\"role_ids\":[$STAFF_ROLE_ID],\"school_id\":$SCHOOL_ID,\"is_super_admin\":false}"
```

### Step F: Verify Effective Permissions and Re-Login Rule

- **GET** `/permissions/me/effective`

```bash
curl -s http://127.0.0.1:8000/api/v1/permissions/me/effective \
  -H "Authorization: Bearer <USER_TOKEN>"
```

Important:
- After changing role/permissions, the user should login again and use a fresh token.
- User `school_id` and role `school_id` must match for school-scoped permissions.

## 6) Feature Endpoints Catalog

All paths below are under `/api/v1`.

### Auth

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### Schools (superadmin)

- `POST /schools`
- `GET /schools`
- `GET /schools/{school_id}`
- `PUT /schools/{school_id}`
- `DELETE /schools/{school_id}`

### Roles

- `POST /roles/` (create role)
- `GET /roles/` (list roles)

### Permissions

- `POST /permissions/` (create permission)
- `GET /permissions/` (list permissions)
- `PUT /permissions/roles/{role_id}` (set role permissions)
- `GET /permissions/roles/{role_id}` (get role permissions)
- `PUT /permissions/users/{user_id}` (set user overrides)
- `GET /permissions/users/{user_id}` (get user overrides)
- `GET /permissions/users/{user_id}/effective` (effective permissions for user)
- `GET /permissions/me/effective` (effective permissions for logged-in user)

### Users

- `GET /users/`
- `GET /users/{user_id}`
- `POST /users/bootstrap` (first user only)
- `POST /users/`
- `PUT /users/{user_id}`
- `DELETE /users/{user_id}`

### People

- Students:
  - `POST /students/onboard`
  - `POST /students`
  - `GET /students`
  - `GET /students/{student_id}`
  - `PUT /students/{student_id}`
  - `DELETE /students/{student_id}`
- Teachers:
  - `POST /teachers`
  - `GET /teachers`
  - `GET /teachers/{teacher_id}`
  - `PUT /teachers/{teacher_id}`
  - `DELETE /teachers/{teacher_id}`
- Parents:
  - `POST /parents`
  - `GET /parents`
  - `GET /parents/{parent_id}`
  - `PUT /parents/{parent_id}`
  - `DELETE /parents/{parent_id}`
- Staff:
  - `POST /staff`
  - `GET /staff`
  - `GET /staff/{staff_id}`
  - `PUT /staff/{staff_id}`
  - `DELETE /staff/{staff_id}`

### Academics

- Classes: `POST/GET /classes`, `GET/DELETE /classes/{class_id}`
- Sections: `POST/GET /sections`, `GET/DELETE /sections/{section_id}`
- Subjects: `POST/GET /subjects`, `GET/DELETE /subjects/{subject_id}`
- Departments: `POST/GET /departments`, `GET/DELETE /departments/{department_id}`
- Teacher Assignments: `POST/GET /teacher-assignments`, `GET/DELETE /teacher-assignments/{assignment_id}`
- Attendance: `POST/GET /attendance`, `GET/DELETE /attendance/{attendance_id}`
- Exams: `POST/GET /exams`, `GET/DELETE /exams/{exam_id}`
- Marks: `POST/GET /marks`, `GET/DELETE /marks/{mark_id}`

### Finance

- Fees:
  - `POST /fees`
  - `GET /fees`
  - `GET /fees/{fee_id}`
  - `PUT /fees/{fee_id}`
  - `DELETE /fees/{fee_id}`
- Payments:
  - `POST /payments`
  - `GET /payments`
  - `GET /payments/{payment_id}`
  - `PUT /payments/{payment_id}`
  - `DELETE /payments/{payment_id}`

### Menus

- `POST /menus`
- `GET /menus`
- `GET /menus/{menu_id}`
- `DELETE /menus/{menu_id}`
- `PUT /role-menus/{role_id}`
- `GET /role-menus/{role_id}`

## 7) Common Permission Names

Permission names follow this pattern:
- `create_<module>`
- `read_<module>`
- `update_<module>`
- `delete_<module>`

Examples:
- `create_students`
- `read_teachers`
- `update_users`
- `delete_fees`

## 8) Typical Access Issues and Fixes

- Token has role but empty permissions:
  - Confirm role is school-scoped with the same `school_id` as the user.
  - Confirm role has entries in `role_permissions`.
- Still denied after updates:
  - Login again and use a new token.
- Cannot assign role to school user:
  - Ensure role belongs to same school and `scope = "SCHOOL"`.

## 9) Recommended Verification Flow After Setup

1. Login as created school admin.
2. Call `GET /permissions/me/effective`.
3. Call one read endpoint per module, e.g.:
   - `GET /students`
   - `GET /teachers`
   - `GET /classes`
   - `GET /fees`
4. If any fail with `Missing required permission`, add that permission to the role and re-login.

---

## 10) Quick Reference Commands

### Start API Server

```bash
cd '/Users/ndkamadi/Documents/Projects/Learning/Practice Projects/school-management/backend'
. .venv/bin/activate
uvicorn main:app --reload
```

### Reset Database and Reinstall Dummy Data (One-Liner)

```bash
cd '/Users/ndkamadi/Documents/Projects/Learning/Practice Projects/school-management/backend' && . .venv/bin/activate && python scripts/reset_and_seed_dummy_data.py
```

### Install Dependencies (Fresh Setup)

```bash
cd '/Users/ndkamadi/Documents/Projects/Learning/Practice Projects/school-management/backend'
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python scripts/reset_and_seed_dummy_data.py
```

### Apply Alembic Migrations

```bash
cd '/Users/ndkamadi/Documents/Projects/Learning/Practice Projects/school-management/backend'
. .venv/bin/activate
alembic upgrade head
```

### Create New Alembic Migration

```bash
cd '/Users/ndkamadi/Documents/Projects/Learning/Practice Projects/school-management/backend'
. .venv/bin/activate
alembic revision --autogenerate -m "describe_change"
```

### Access API Documentation

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`


