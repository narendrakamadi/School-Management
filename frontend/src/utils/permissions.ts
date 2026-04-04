import type { AccessRule, AclSnapshot } from "../config/acl";
import { canAccessByRule } from "../config/acl";

export const normalizePermissions = (permissions: string[]): string[] => {
    const unique = new Set<string>();
    permissions.forEach((permission) => {
        const normalized = permission.trim();
        if (normalized.length > 0) {
            unique.add(normalized);
        }
    });

    return Array.from(unique);
};

export const hasPermission = (
    permissions: string[],
    permission: string,
): boolean => {
    return permissions.includes(permission);
};

export const hasAnyPermission = (
    permissions: string[],
    requiredPermissions: string[],
): boolean => {
    if (requiredPermissions.length === 0) {
        return true;
    }

    return requiredPermissions.some((permission) =>
        permissions.includes(permission),
    );
};

export const hasAllPermissions = (
    permissions: string[],
    requiredPermissions: string[],
): boolean => {
    if (requiredPermissions.length === 0) {
        return true;
    }

    return requiredPermissions.every((permission) =>
        permissions.includes(permission),
    );
};

export const canAccess = (acl: AclSnapshot, rule?: AccessRule): boolean => {
    return canAccessByRule(acl, rule);
};

