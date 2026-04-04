from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class UserInfo(BaseModel):
    id: int | str
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    username: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    school_id: int | None = None
    is_super_admin: bool = False
    roles: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)
    user: UserInfo | None = None


class LogoutResponse(BaseModel):
    message: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str | None = None
    reset_link: str | None = None


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=20)
    new_password: str = Field(min_length=8)


class MessageResponse(BaseModel):
    message: str


