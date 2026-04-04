import { axiosInstance } from "../axiosInstance";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token?: string;
    access_token?: string;
    token_type?: string;
    school_id?: number | null;
    is_super_admin?: boolean;
    roles?: string[];
    permissions?: string[];
    user?: {
        id?: number | string;
        fullName?: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        username?: string;
        role?: string;
        roles?: string[];
        permissions?: string[];
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface EffectivePermissionResponse {
    user_id: number;
    username: string;
    school_id: number | null;
    roles: string[];
    permissions: string[];
}

export const authApi = {
    login: async (payload: LoginRequest): Promise<LoginResponse> => {
        const { data } = await axiosInstance.post<LoginResponse>(
            "/auth/login",
            payload,
        );
        return data;
    },

    logout: async (): Promise<void> => {
        await axiosInstance.post("/auth/logout");
    },

    getMyEffectivePermissions: async (
        token?: string,
    ): Promise<EffectivePermissionResponse> => {
        const { data } = await axiosInstance.get<EffectivePermissionResponse>(
            "/permissions/me/effective",
            token
                ? {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
                : undefined,
        );
        return data;
    },
};
