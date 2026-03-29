from dataclasses import dataclass

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_token
from app.db.session import get_db
from app.models.revoked_token import RevokedToken
from app.repositories.user_repo import UserRepository

security = HTTPBearer()
repo = UserRepository()


@dataclass
class CurrentUserContext:
    user: object
    school_id: int | None
    is_super_admin: bool


def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    try:
        payload = decode_token(token.credentials)

        jti = payload.get("jti")
        if not jti:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        revoked_token = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
        if revoked_token:
            raise HTTPException(status_code=401, detail="Token has been revoked")

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = repo.get_by_id(db, int(user_id))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        token_school_id = payload.get("school_id")
        if token_school_id is not None:
            token_school_id = int(token_school_id)

        user_school_id = getattr(user, "school_id", None)
        is_super_admin = bool(getattr(user, "is_super_admin", False))

        if not is_super_admin and user_school_id is None:
            raise HTTPException(status_code=403, detail="User is not assigned to a school")

        if not is_super_admin and token_school_id is not None and user_school_id != token_school_id:
            raise HTTPException(status_code=401, detail="Invalid tenant context")

        active_school_id = token_school_id if token_school_id is not None else user_school_id
        setattr(user, "active_school_id", active_school_id)

        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user_with_school_context(current_user=Depends(get_current_user)) -> CurrentUserContext:
    return CurrentUserContext(
        user=current_user,
        school_id=getattr(current_user, "active_school_id", None),
        is_super_admin=bool(getattr(current_user, "is_super_admin", False)),
    )
