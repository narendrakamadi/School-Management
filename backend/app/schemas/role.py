from pydantic import BaseModel


class RoleCreate(BaseModel):
    name: str
    description: str | None = None
    is_system: bool = False


class RoleOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    is_system: bool

    class Config:
        from_attributes = True
