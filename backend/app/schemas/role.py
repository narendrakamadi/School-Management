from pydantic import BaseModel


class RoleCreate(BaseModel):
    name: str
    description: str | None = None
    is_system: bool = False
    scope: str = "SCHOOL"
    school_id: int | None = None


class RoleOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    is_system: bool
    scope: str
    school_id: int | None = None

    class Config:
        from_attributes = True
