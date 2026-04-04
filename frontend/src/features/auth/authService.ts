import { authApi, type LoginResponse } from "../../api/endpoints/authApi";
import { normalizeRoles, type Role } from "../../types/roles";

interface ResolvedAcl {
    roles: Role[];
    permissions: string[];
}

const ACL_FETCH_TIMEOUT_MS = 4000;

const normalizePermissions = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    const permissions = new Set<string>();
    value.forEach((permission) => {
        if (typeof permission === "string" && permission.trim()) {
            permissions.add(permission.trim());
        }
    });

    return Array.from(permissions);
};

const extractRolesFromLoginResponse = (response: LoginResponse): Role[] => {
    return normalizeRoles([
        ...(Array.isArray(response.roles) ? response.roles : []),
        ...(Array.isArray(response.user?.roles) ? response.user.roles : []),
        response.is_super_admin ? "superadmin" : undefined,
        response.user?.role,
    ]);
};

const extractPermissionsFromLoginResponse = (response: LoginResponse): string[] => {
    return normalizePermissions([
        ...(Array.isArray(response.permissions) ? response.permissions : []),
        ...(Array.isArray(response.user?.permissions) ? response.user.permissions : []),
    ]);
};

export const resolveAcl = async (
    response: LoginResponse,
    token: string,
): Promise<ResolvedAcl> => {
    const fallbackAcl = extractAclFromLoginResponse(response);

    try {
        const effective = await Promise.race([
            authApi.getMyEffectivePermissions(token),
            new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error("ACL fetch timeout")), ACL_FETCH_TIMEOUT_MS);
            }),
        ]);
        const effectiveRoles = normalizeRoles(effective.roles);
        const effectivePermissions = normalizePermissions(effective.permissions);

        return {
            roles: effectiveRoles.length > 0 ? effectiveRoles : fallbackAcl.roles,
            permissions:
                effectivePermissions.length > 0
                    ? effectivePermissions
                    : fallbackAcl.permissions,
        };
    } catch {
        return fallbackAcl;
    }
};

export const extractAclFromLoginResponse = (
    response: LoginResponse,
): ResolvedAcl => {
    return {
        roles: extractRolesFromLoginResponse(response),
        permissions: extractPermissionsFromLoginResponse(response),
    };
};

