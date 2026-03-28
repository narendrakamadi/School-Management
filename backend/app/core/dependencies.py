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

        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")