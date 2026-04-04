import { useCallback, useMemo } from "react";
import type { AccessRule } from "../config/acl";
import { useAuth } from "./useAuth";
import {
    canAccess,
    hasAllPermissions,
    hasAnyPermission,
    hasPermission,
} from "../utils/permissions";

export const usePermission = () => {
    const { isAuthenticated, userRoles, permissions } = useAuth();

    const aclSnapshot = useMemo(
        () => ({
            isAuthenticated,
            roles: userRoles,
            permissions,
        }),
        [isAuthenticated, permissions, userRoles],
    );

    const can = useCallback(
        (permission: string) => hasPermission(permissions, permission),
        [permissions],
    );

    const canAny = useCallback(
        (requiredPermissions: string[]) =>
            hasAnyPermission(permissions, requiredPermissions),
        [permissions],
    );

    const canAll = useCallback(
        (requiredPermissions: string[]) =>
            hasAllPermissions(permissions, requiredPermissions),
        [permissions],
    );

    const canAccessRule = useCallback(
        (rule?: AccessRule) => canAccess(aclSnapshot, rule),
        [aclSnapshot],
    );

    return {
        permissions,
        can,
        canAny,
        canAll,
        canAccess: canAccessRule,
    };
};

