from datetime import datetime, timezone

from fastapi import HTTPException

from app.repositories.user_repo import UserRepository
from app.core.security import create_access_token, decode_token, verify_password
from app.models.revoked_token import RevokedToken
from app.rbac.permissions import get_effective_permission_names


class AuthService:

    def __init__(self):
        self.repo = UserRepository()

    def login(self, db, username, password):
        user = self.repo.get_by_username(db, username)

        if not user or not verify_password(password, user.hashed_password):
            return None

        roles = [role.name for role in user.roles]
        permissions = get_effective_permission_names(user)
        token = create_access_token({"sub": str(user.id), "roles": roles, "permissions": permissions})
        return {
            "access_token": token,
            "token_type": "bearer",
            "roles": roles,
            "permissions": permissions,
        }

    def logout(self, db, token: str):
        try:
            payload = decode_token(token)
        except Exception as exc:
            raise HTTPException(status_code=401, detail="Invalid token") from exc

        jti = payload.get("jti")
        exp = payload.get("exp")

        if not jti or exp is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        existing_revocation = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
        if existing_revocation:
            return {"message": "Logged out successfully"}

        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc) if isinstance(exp, (int, float)) else exp
        db.add(RevokedToken(jti=jti, token_type="access", expires_at=expires_at))
        db.commit()

        return {"message": "Logged out successfully"}

