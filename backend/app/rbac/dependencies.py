from fastapi import Depends, HTTPException

from app.core.dependencies import get_current_user_with_school_context
from app.rbac.permissions import get_effective_permission_names, has_permission
from app.rbac.roles import SUPERADMIN


def require_roles(*allowed_roles: str):
	def checker(context=Depends(get_current_user_with_school_context)):
		current_user = context.user
		user_roles = {
			role.name
			for role in current_user.roles
			if role.scope == "GLOBAL" or role.school_id == context.school_id
		}

		if getattr(current_user, "is_super_admin", False) or SUPERADMIN in user_roles:
			return current_user

		if allowed_roles and user_roles.isdisjoint(set(allowed_roles)):
			raise HTTPException(status_code=403, detail="Insufficient role permissions")

		return current_user

	return checker


def require_permission(permission_name: str):
	def checker(context=Depends(get_current_user_with_school_context)):
		current_user = context.user
		if not has_permission(current_user, permission_name, school_id=context.school_id):
			raise HTTPException(status_code=403, detail="Missing required permission")

		return current_user

	return checker


def require_any_permission(*permission_names: str):
	def checker(context=Depends(get_current_user_with_school_context)):
		current_user = context.user
		effective_permissions = set(get_effective_permission_names(current_user, school_id=context.school_id))

		if permission_names and effective_permissions.isdisjoint(set(permission_names)):
			raise HTTPException(status_code=403, detail="Missing required permission")

		return current_user

	return checker


