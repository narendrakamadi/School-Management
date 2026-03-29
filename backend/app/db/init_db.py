from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.models.permission import Permission
from app.models.role import Role
from app.rbac.permissions import build_permission_name


DEFAULT_ROLES = [
	{"name": "superadmin", "description": "Platform super administrator", "is_system": True, "scope": "GLOBAL", "school_id": None},
	{"name": "admin", "description": "System administrator", "is_system": True, "scope": "GLOBAL", "school_id": None},
	{"name": "teacher", "description": "Teacher role", "is_system": True, "scope": "GLOBAL", "school_id": None},
	{"name": "student", "description": "Student role", "is_system": True, "scope": "GLOBAL", "school_id": None},
	{"name": "parent", "description": "Parent role", "is_system": True, "scope": "GLOBAL", "school_id": None},
	{"name": "staff", "description": "Staff role", "is_system": True, "scope": "GLOBAL", "school_id": None},
]

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


def _ensure_column(db: Session, table_name: str, column_name: str, ddl: str):
	inspector = inspect(db.bind)
	existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
	if column_name in existing_columns:
		return

	db.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {ddl}"))


def ensure_schema_compatibility(db: Session):
	# Backfill columns introduced during multi-tenant rollout for legacy DBs.
	_ensure_column(db, "roles", "scope", "scope VARCHAR(32) NOT NULL DEFAULT 'GLOBAL'")
	_ensure_column(db, "roles", "school_id", "school_id INTEGER")
	_ensure_column(db, "users", "school_id", "school_id INTEGER")
	_ensure_column(db, "users", "is_super_admin", "is_super_admin BOOLEAN NOT NULL DEFAULT FALSE")
	_ensure_column(db, "user_roles", "school_id", "school_id INTEGER")

	db.execute(text("UPDATE roles SET scope = 'GLOBAL' WHERE scope IS NULL"))
	db.commit()


def init_db(db: Session):
	ensure_schema_compatibility(db)

	existing_roles = {(role.name, role.scope, role.school_id) for role in db.query(Role).all()}

	for role_data in DEFAULT_ROLES:
		role_key = (role_data["name"], role_data["scope"], role_data["school_id"])
		if role_key not in existing_roles:
			db.add(Role(**role_data))

	existing_permissions = {permission.name for permission in db.query(Permission).all()}

	for module in DEFAULT_PERMISSION_MODULES:
		for action in DEFAULT_PERMISSION_ACTIONS:
			permission_name = build_permission_name(module, action)
			if permission_name not in existing_permissions:
				db.add(Permission(name=permission_name, module=module, action=action))

	db.commit()

	full_access_roles = db.query(Role).filter(Role.name.in_(["superadmin", "admin"])).all()
	all_permissions = db.query(Permission).all()
	for role in full_access_roles:
		role.permissions = all_permissions
		db.add(role)

	db.commit()

