from pydantic import BaseModel, Field

from app.schemas.role import RoleOut


class MenuBase(BaseModel):
    name: str
    path: str | None = None
    icon: str | None = None
    parent_id: int | None = None
    order_index: int = 0


class MenuCreate(MenuBase):
    pass


class MenuOut(MenuBase):
    id: int

    class Config:
        from_attributes = True


class RoleMenuUpdate(BaseModel):
    menu_ids: list[int] = Field(default_factory=list)


class RoleMenuResponse(BaseModel):
    role: RoleOut
    menus: list[MenuOut] = Field(default_factory=list)

