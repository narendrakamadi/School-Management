from sqlalchemy.orm import Session

from app.models.permission import Permission
from app.models.role import Role
from app.rbac.permissions import build_permission_name


DEFAULT_ROLES = [
	{"name": "superadmin", "description": "Platform super administrator", "is_system": True},
	{"name": "admin", "description": "System administrator", "is_system": True},
	{"name": "teacher", "description": "Teacher role", "is_system": True},
	{"name": "student", "description": "Student role", "is_system": True},
	{"name": "parent", "description": "Parent role", "is_system": True},
	{"name": "staff", "description": "Staff role", "is_system": True},
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
]

DEFAULT_PERMISSION_ACTIONS = ["create", "read", "update", "delete"]


def init_db(db: Session):
	existing_roles = {role.name for role in db.query(Role).all()}

	for role_data in DEFAULT_ROLES:
		if role_data["name"] not in existing_roles:
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

