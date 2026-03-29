from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine_kwargs = {"echo": False, "pool_pre_ping": True}
if settings.DB_CONNECTION.startswith("postgresql"):
    engine_kwargs["connect_args"] = {"connect_timeout": 5}

engine = create_engine(settings.DB_CONNECTION, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()