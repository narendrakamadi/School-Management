def build_permission_name(module: str, action: str) -> str:
	return f"{action}_{module}"


def _role_applies_to_school(role, school_id: int | None) -> bool:
	if role.scope == "GLOBAL":
		return True
	if school_id is None:
		return False
	return role.school_id == school_id


def get_effective_permission_names(user, school_id: int | None = None) -> list[str]:
	if getattr(user, "is_super_admin", False):
		all_permissions = {
			permission.name
			for role in getattr(user, "roles", [])
			for permission in getattr(role, "permissions", [])
		}
		return sorted(all_permissions)

	active_school_id = school_id if school_id is not None else getattr(user, "active_school_id", None)

	role_permissions = {
		permission.name
		for role in getattr(user, "roles", [])
		if _role_applies_to_school(role, active_school_id)
		for permission in getattr(role, "permissions", [])
	}

	overrides = {
		override.permission.name: override.is_allowed
		for override in getattr(user, "permission_overrides", [])
		if getattr(override, "permission", None) is not None
	}

	effective_permissions = {
		permission_name
		for permission_name in role_permissions
		if overrides.get(permission_name) is not False
	}

	for permission_name, is_allowed in overrides.items():
		if is_allowed:
			effective_permissions.add(permission_name)
		else:
			effective_permissions.discard(permission_name)

	return sorted(effective_permissions)


def has_permission(user, permission_name: str, school_id: int | None = None) -> bool:
	return permission_name in set(get_effective_permission_names(user, school_id=school_id))

