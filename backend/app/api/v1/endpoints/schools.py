from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_with_school_context
from app.db.session import get_db
from app.rbac.dependencies import require_roles
from app.rbac.roles import SUPERADMIN
from app.schemas.common import DeleteResponse
from app.schemas.school import SchoolCreate, SchoolOut, SchoolUpdate
from app.services.school_service import SchoolService

router = APIRouter()
service = SchoolService()


@router.post("/schools", response_model=SchoolOut, dependencies=[Depends(require_roles(SUPERADMIN))])
def create_school(
    data: SchoolCreate,
    db: Session = Depends(get_db),
    context=Depends(get_current_user_with_school_context),
):
    return service.create_school(db, data, created_by=context.user.id)


@router.get("/schools", response_model=list[SchoolOut], dependencies=[Depends(require_roles(SUPERADMIN))])
def list_schools(db: Session = Depends(get_db)):
    return service.list_schools(db)


@router.get("/schools/{school_id}", response_model=SchoolOut, dependencies=[Depends(require_roles(SUPERADMIN))])
def get_school(school_id: int, db: Session = Depends(get_db)):
    return service.get_school(db, school_id)


@router.put("/schools/{school_id}", response_model=SchoolOut, dependencies=[Depends(require_roles(SUPERADMIN))])
def update_school(
    school_id: int,
    data: SchoolUpdate,
    db: Session = Depends(get_db),
):
    return service.update_school(db, school_id, data)


@router.delete("/schools/{school_id}", response_model=DeleteResponse, dependencies=[Depends(require_roles(SUPERADMIN))])
def delete_school(school_id: int, db: Session = Depends(get_db)):
    return service.delete_school(db, school_id)

