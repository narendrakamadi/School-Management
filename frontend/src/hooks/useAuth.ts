import { useAppSelector } from "../store/hooks";
import {
    selectAclLoaded,
    selectAuthPermissions,
    selectAuthRole,
    selectAuthRoles,
    selectAuthUser,
    selectIsAuthenticated,
} from "../features/auth/authSelectors";

export const useAuth = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectAuthUser);
    const userRole = useAppSelector(selectAuthRole);
    const userRoles = useAppSelector(selectAuthRoles);
    const permissions = useAppSelector(selectAuthPermissions);
    const aclLoaded = useAppSelector(selectAclLoaded);

    return { isAuthenticated, user, userRole, userRoles, permissions, aclLoaded };
};
