import type { Role } from "../../types/roles";

export const AUTH_STORAGE_KEY = "school-management-auth";

export interface LoginFormValues {
    username: string;
    password: string;
}

export interface RegisterFormValues {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthUser {
    id?: number | string;
    fullName?: string;
    email?: string;
    username?: string;
}

export interface AuthState {
    token: string | null;
    user: AuthUser | null;
    role: Role | null;
    roles: Role[];
    permissions: string[];
    aclLoaded: boolean;
    isAuthenticated: boolean;
}