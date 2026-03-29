from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, unquote_plus, urlparse

from fastapi import HTTPException

from app.core.config import settings
from app.repositories.user_repo import UserRepository
from app.core.security import (
    create_access_token,
    decode_token,
    generate_password_reset_token,
    hash_password,
    hash_password_reset_token,
    verify_password,
)
from app.models.password_reset_token import PasswordResetToken
from app.models.revoked_token import RevokedToken
from app.rbac.permissions import get_effective_permission_names


class AuthService:

    def __init__(self):
        self.repo = UserRepository()

    @staticmethod
    def _normalize_reset_token(raw_token: str) -> str:
        token = (raw_token or "").strip().strip("\"'")

        if token.lower().startswith("bearer "):
            token = token[7:].strip()

        if "token=" in token:
            if "://" in token:
                parsed = urlparse(token)
                query_values = parse_qs(parsed.query)
            else:
                query_values = parse_qs(token)

            extracted = query_values.get("token", [])
            if extracted:
                token = extracted[0]

        return unquote_plus(token).strip()

    def login(self, db, username, password):
        user = self.repo.get_by_username(db, username)

        if not user or not verify_password(password, user.hashed_password):
            return None

        roles = [role.name for role in user.roles]
        school_id = user.school_id
        permissions = get_effective_permission_names(user, school_id=school_id)
        token = create_access_token(
            {
                "sub": str(user.id),
                "roles": roles,
                "permissions": permissions,
                "school_id": school_id,
                "is_super_admin": bool(user.is_super_admin),
            }
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "school_id": school_id,
            "is_super_admin": bool(user.is_super_admin),
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

    def request_password_reset(self, db, email: str):
        generic_message = "If the account exists, a reset link has been sent."
        user = self.repo.get_by_email(db, email)

        # Always return a generic message to avoid account enumeration.
        if not user:
            return {"message": generic_message}

        token = generate_password_reset_token()
        token_hash = hash_password_reset_token(token)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)

        # Invalidate any previous active reset tokens for this user.
        now = datetime.now(timezone.utc)
        (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used_at.is_(None),
                PasswordResetToken.expires_at > now,
            )
            .update({PasswordResetToken.used_at: now}, synchronize_session=False)
        )

        db.add(PasswordResetToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at))
        db.commit()

        payload = {"message": generic_message}
        if settings.FRONTEND_RESET_URL:
            separator = "&" if "?" in settings.FRONTEND_RESET_URL else "?"
            payload["reset_link"] = f"{settings.FRONTEND_RESET_URL}{separator}token={token}"

        # Useful for local testing only; keep disabled in production.
        if settings.EXPOSE_PASSWORD_RESET_TOKEN:
            payload["reset_token"] = token

        return payload

    def reset_password(self, db, token: str, new_password: str):
        normalized_token = self._normalize_reset_token(token)
        if not normalized_token:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        token_hash = hash_password_reset_token(normalized_token)
        reset_record = (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.token_hash == token_hash,
                PasswordResetToken.used_at.is_(None),
            )
            .first()
        )

        if not reset_record:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        now = datetime.now(timezone.utc)
        if reset_record.expires_at < now:
            reset_record.used_at = now
            db.commit()
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        user = self.repo.get_by_id(db, reset_record.user_id)
        if not user:
            reset_record.used_at = now
            db.commit()
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        user.hashed_password = hash_password(new_password)
        reset_record.used_at = now

        # Invalidate sibling active tokens in one shot.
        (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.id != reset_record.id,
                PasswordResetToken.used_at.is_(None),
                PasswordResetToken.expires_at > now,
            )
            .update({PasswordResetToken.used_at: now}, synchronize_session=False)
        )

        db.commit()
        return {"message": "Password reset successful"}

