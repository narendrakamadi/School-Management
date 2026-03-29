from datetime import datetime

from pydantic import BaseModel, EmailStr


class SchoolBase(BaseModel):
    name: str
    code: str
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    status: str | None = "active"


class SchoolCreate(SchoolBase):
    pass


class SchoolUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    status: str | None = None


class SchoolOut(SchoolBase):
    id: int
    created_by: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

