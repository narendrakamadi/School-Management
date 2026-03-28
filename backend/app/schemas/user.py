from pydantic import BaseModel, EmailStr, Field

from app.schemas.role import RoleOut


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    password: str
    role_ids: list[int] = Field(default_factory=list)


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    roles: list[RoleOut] = Field(default_factory=list)

    class Config:
        from_attributes = True