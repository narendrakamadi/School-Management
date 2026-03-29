from pydantic import BaseModel, Field


class PermissionCreate(BaseModel):
    module: str
    action: str
    name: str | None = None


class PermissionOut(BaseModel):
    id: int
    name: str
    module: str
    action: str

    class Config:
        from_attributes = True


class RolePermissionUpdate(BaseModel):
    permission_ids: list[int] = Field(default_factory=list)


class RolePermissionResponse(BaseModel):
    role_id: int
    role_name: str
    permissions: list[PermissionOut] = Field(default_factory=list)


class UserPermissionAssignment(BaseModel):
    permission_id: int
    is_allowed: bool = True


class UserPermissionUpdate(BaseModel):
    permissions: list[UserPermissionAssignment] = Field(default_factory=list)


class UserPermissionOverrideOut(BaseModel):
    permission: PermissionOut
    is_allowed: bool


class UserPermissionResponse(BaseModel):
    user_id: int
    username: str
    overrides: list[UserPermissionOverrideOut] = Field(default_factory=list)


class EffectivePermissionResponse(BaseModel):
    user_id: int
    username: str
    school_id: int | None = None
    roles: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)
