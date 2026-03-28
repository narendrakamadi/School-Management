from fastapi import FastAPI
from app.api.v1.router import api_router

from app.db.base import Base
from app.db.init_db import init_db
from app.db.session import engine
from app.db.session import SessionLocal

# Import all models so SQLAlchemy knows them
from app.models import *

app = FastAPI(
    title="School Management API",
    description="API for managing users, roles, students, and teachers with RBAC support",
    version="1.0.0"
)

# Create tables
Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    init_db(db)

app.include_router(api_router, prefix="/api/v1")