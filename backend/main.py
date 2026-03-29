from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

from app.db.base import Base
from app.db.init_db import ensure_schema_compatibility, init_db
from app.db.session import engine
from app.db.session import SessionLocal

# Import all models so SQLAlchemy knows them
from app.models import *

app = FastAPI(
    title="School Management API",
    description="API for managing users, roles, students, and teachers with RBAC support",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_init_db():
    # Always run lightweight compatibility checks so legacy DBs get missing columns.
    try:
        with SessionLocal() as db:
            ensure_schema_compatibility(db)
    except Exception as exc:
        print(f"Startup schema compatibility check skipped due to error: {exc}")

    if not settings.AUTO_INIT_DB:
        return

    # Run schema creation/seeding at startup when explicitly enabled.
    try:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            init_db(db)
    except Exception as exc:
        # Do not block API process startup if DB init task fails.
        print(f"Startup DB initialization skipped due to error: {exc}")

app.include_router(api_router, prefix="/api/v1")