import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthUser } from "./authTypes";
import type { Role } from "../../types/roles";

interface SetCredentialsPayload {
    token: string;
    user: AuthUser | null;
    roles: Role[];
    permissions: string[];
}

interface SetAclPayload {
    roles: Role[];
    permissions: string[];
}

const initialState: AuthState = {
    token: null,
    user: null,
    role: null,
    roles: [],
    permissions: [],
    aclLoaded: false,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.roles = action.payload.roles;
            state.permissions = action.payload.permissions;
            state.role = action.payload.roles[0] ?? null;
            state.aclLoaded = true;
            state.isAuthenticated = true;
        },
        setAcl: (state, action: PayloadAction<SetAclPayload>) => {
            state.roles = action.payload.roles;
            state.permissions = action.payload.permissions;
            state.role = action.payload.roles[0] ?? null;
            state.aclLoaded = true;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.role = null;
            state.roles = [];
            state.permissions = [];
            state.aclLoaded = false;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, setAcl, logout } = authSlice.actions;
export default authSlice.reducer;
