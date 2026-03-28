from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    roles: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)


class LogoutResponse(BaseModel):
    message: str

