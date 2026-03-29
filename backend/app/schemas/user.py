from pydantic import BaseModel, EmailStr, Field

from app.schemas.role import RoleOut


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    password: str
    role_ids: list[int] = Field(default_factory=list)
    school_id: int | None = None
    is_super_admin: bool = False


class UserOut(BaseModel):
    id: int
    first_name: str | None = None
    last_name: str | None = None
    email: str
    username: str
    school_id: int | None = None
    is_super_admin: bool = False
    roles: list[RoleOut] = Field(default_factory=list)

    class Config:
        from_attributes = True