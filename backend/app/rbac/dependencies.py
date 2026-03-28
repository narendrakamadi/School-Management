from fastapi import Depends, HTTPException

from app.core.dependencies import get_current_user
from app.rbac.permissions import get_effective_permission_names, has_permission
from app.rbac.roles import SUPERADMIN


def require_roles(*allowed_roles: str):
	def checker(current_user=Depends(get_current_user)):
		user_roles = {role.name for role in current_user.roles}

		if SUPERADMIN in user_roles:
			return current_user

		if allowed_roles and user_roles.isdisjoint(set(allowed_roles)):
			raise HTTPException(status_code=403, detail="Insufficient role permissions")

		return current_user

	return checker


def require_permission(permission_name: str):
	def checker(current_user=Depends(get_current_user)):
		if not has_permission(current_user, permission_name):
			raise HTTPException(status_code=403, detail="Missing required permission")

		return current_user

	return checker


def require_any_permission(*permission_names: str):
	def checker(current_user=Depends(get_current_user)):
		effective_permissions = set(get_effective_permission_names(current_user))

		if permission_names and effective_permissions.isdisjoint(set(permission_names)):
			raise HTTPException(status_code=403, detail="Missing required permission")

		return current_user

	return checker


