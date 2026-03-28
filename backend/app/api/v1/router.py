from fastapi import APIRouter
from app.api.v1.endpoints import academics, auth, finance, menus, people, permissions, roles, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(permissions.router, prefix="/permissions", tags=["Permissions"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(people.router, tags=["People"])
api_router.include_router(academics.router, tags=["Academics"])
api_router.include_router(finance.router, tags=["Finance"])
api_router.include_router(menus.router, tags=["Menus"])
