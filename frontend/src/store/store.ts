import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import {
    AUTH_STORAGE_KEY,
    type AuthState,
    type AuthUser,
} from "../features/auth/authTypes";
import { normalizeRole, normalizeRoles } from "../types/roles";
import { normalizePermissions } from "../utils/permissions";

const getPersistedAuthState = (): AuthState | undefined => {
    if (typeof window === "undefined") {
        return undefined;
    }

    const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawAuth) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(rawAuth) as {
            token?: unknown;
            user?: unknown;
            role?: unknown;
            roles?: unknown;
            permissions?: unknown;
            aclLoaded?: unknown;
        };

        if (typeof parsed.token !== "string" || parsed.token.length === 0) {
            return undefined;
        }

        const user =
            parsed.user && typeof parsed.user === "object"
                ? (parsed.user as AuthUser)
                : null;

        const roles = normalizeRoles(parsed.roles);
        const fallbackRole = normalizeRole(parsed.role);
        if (fallbackRole && !roles.includes(fallbackRole)) {
            roles.push(fallbackRole);
        }

        const permissions = normalizePermissions(
            Array.isArray(parsed.permissions)
                ? parsed.permissions.filter(
                    (permission): permission is string =>
                        typeof permission === "string",
                )
                : [],
        );

        return {
            token: parsed.token,
            user,
            role: roles[0] ?? null,
            roles,
            permissions,
            aclLoaded:
                typeof parsed.aclLoaded === "boolean"
                    ? parsed.aclLoaded
                    : true,
            isAuthenticated: true,
        };
    } catch {
        return undefined;
    }
};

const preloadedAuthState = getPersistedAuthState();

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    preloadedState: preloadedAuthState ? { auth: preloadedAuthState } : undefined,
});

store.subscribe(() => {
    if (typeof window === "undefined") {
        return;
    }

    const { auth } = store.getState();

    if (!auth.isAuthenticated || !auth.token) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
    }

    localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
            token: auth.token,
            user: auth.user,
            role: auth.role,
            roles: auth.roles,
            permissions: auth.permissions,
            aclLoaded: auth.aclLoaded,
        }),
    );
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
