from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_CONNECTION: str
    AUTO_INIT_DB: bool = False

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    RESET_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_RESET_URL: str | None = None
    EXPOSE_PASSWORD_RESET_TOKEN: bool = False

    class Config:
        env_file = ".env"


settings = Settings()