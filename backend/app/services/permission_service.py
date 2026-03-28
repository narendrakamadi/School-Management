from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.permission import UserPermission
from app.repositories.permission_repo import PermissionRepository
from app.repositories.role_repo import RoleRepository
from app.repositories.user_repo import UserRepository
from app.rbac.permissions import build_permission_name, get_effective_permission_names
from app.schemas.permission import (
    EffectivePermissionResponse,
    PermissionCreate,
    RolePermissionResponse,
    UserPermissionResponse,
    UserPermissionUpdate,
)


class PermissionService:

    def __init__(self):
        self.permission_repo = PermissionRepository()
        self.role_repo = RoleRepository()
        self.user_repo = UserRepository()

    def create_permission(self, db: Session, data: PermissionCreate):
        permission_name = data.name or build_permission_name(data.module, data.action)

        existing_permission = self.permission_repo.get_by_name(db, permission_name)
        if existing_permission:
            raise HTTPException(status_code=400, detail="Permission already exists")

        return self.permission_repo.create(
            db,
            {
                "name": permission_name,
                "module": data.module,
                "action": data.action,
            },
        )

    def list_permissions(self, db: Session):
        return self.permission_repo.list_all(db)

    def set_role_permissions(self, db: Session, role_id: int, permission_ids: list[int]):
        role = self.role_repo.get_by_id(db, role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        unique_permission_ids = list(dict.fromkeys(permission_ids))
        permissions = self.permission_repo.get_by_ids(db, unique_permission_ids)

        if len(permissions) != len(unique_permission_ids):
            raise HTTPException(status_code=400, detail="One or more permissions do not exist")

        role.permissions = permissions
        role = self.role_repo.save(db, role)
        return self._build_role_permission_response(role)

    def get_role_permissions(self, db: Session, role_id: int):
        role = self.role_repo.get_by_id(db, role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        return self._build_role_permission_response(role)

    def set_user_permissions(self, db: Session, user_id: int, data: UserPermissionUpdate):
        user = self.user_repo.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        assignment_map: dict[int, bool] = {}
        for assignment in data.permissions:
            assignment_map[assignment.permission_id] = assignment.is_allowed

        permissions = self.permission_repo.get_by_ids(db, list(assignment_map.keys()))
        if len(permissions) != len(assignment_map):
            raise HTTPException(status_code=400, detail="One or more permissions do not exist")

        permission_by_id = {permission.id: permission for permission in permissions}
        user.permission_overrides = [
            UserPermission(
                permission_id=permission_id,
                permission=permission_by_id[permission_id],
                is_allowed=is_allowed,
            )
            for permission_id, is_allowed in assignment_map.items()
        ]

        db.add(user)
        db.commit()
        db.refresh(user)

        user = self.user_repo.get_by_id(db, user_id)
        return self._build_user_permission_response(user)

    def get_user_permissions(self, db: Session, user_id: int):
        user = self.user_repo.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return self._build_user_permission_response(user)

    def get_effective_permissions(self, db: Session, user_id: int):
        user = self.user_repo.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return self.build_effective_permission_response(user)

    def build_effective_permission_response(self, user) -> EffectivePermissionResponse:
        return EffectivePermissionResponse(
            user_id=user.id,
            username=user.username,
            roles=sorted(role.name for role in user.roles),
            permissions=get_effective_permission_names(user),
        )

    def _build_role_permission_response(self, role) -> RolePermissionResponse:
        return RolePermissionResponse(
            role_id=role.id,
            role_name=role.name,
            permissions=sorted(role.permissions, key=lambda permission: permission.name),
        )

    def _build_user_permission_response(self, user) -> UserPermissionResponse:
        sorted_overrides = sorted(
            user.permission_overrides,
            key=lambda override: override.permission.name if override.permission else "",
        )

        return UserPermissionResponse(
            user_id=user.id,
            username=user.username,
            overrides=[
                {
                    "permission": override.permission,
                    "is_allowed": override.is_allowed,
                }
                for override in sorted_overrides
                if override.permission is not None
            ],
        )
