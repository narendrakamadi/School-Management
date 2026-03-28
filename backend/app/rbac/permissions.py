def build_permission_name(module: str, action: str) -> str:
	return f"{action}_{module}"


def get_effective_permission_names(user) -> list[str]:
	role_permissions = {
		permission.name
		for role in getattr(user, "roles", [])
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


def has_permission(user, permission_name: str) -> bool:
	return permission_name in set(get_effective_permission_names(user))

