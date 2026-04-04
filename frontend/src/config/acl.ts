import type { Role } from "../types/roles";

export interface AccessRule {
    anyRoles?: Role[];
    allRoles?: Role[];
    anyPermissions?: string[];
    allPermissions?: string[];
}

export interface AclSnapshot {
    roles: Role[];
    permissions: string[];
    isAuthenticated: boolean;
}

const includesAny = <T>(values: T[], required: T[]): boolean => {
    if (required.length === 0) {
        return true;
    }

    return required.some((value) => values.includes(value));
};

const includesAll = <T>(values: T[], required: T[]): boolean => {
    if (required.length === 0) {
        return true;
    }

    return required.every((value) => values.includes(value));
};

export const canAccessByRule = (
    acl: AclSnapshot,
    rule?: AccessRule,
): boolean => {
    if (!acl.isAuthenticated) {
        return false;
    }

    if (!rule) {
        return true;
    }

    if (rule.anyRoles && !includesAny(acl.roles, rule.anyRoles)) {
        return false;
    }

    if (rule.allRoles && !includesAll(acl.roles, rule.allRoles)) {
        return false;
    }

    if (
        rule.anyPermissions &&
        !includesAny(acl.permissions, rule.anyPermissions)
    ) {
        return false;
    }

    if (
        rule.allPermissions &&
        !includesAll(acl.permissions, rule.allPermissions)
    ) {
        return false;
    }

    return true;
};

