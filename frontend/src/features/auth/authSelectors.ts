import type { RootState } from "../../store/store";

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthRole = (state: RootState) => state.auth.role;
export const selectAuthRoles = (state: RootState) => state.auth.roles;
export const selectAuthPermissions = (state: RootState) => state.auth.permissions;
export const selectAclLoaded = (state: RootState) => state.auth.aclLoaded;
