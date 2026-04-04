import { Navigate } from "react-router-dom";
import type { AccessRule } from "../config/acl";
import type { Role } from "../types/roles";
import { canAccess } from "../utils/permissions";

interface Props {
    children: React.ReactNode;
    access?: AccessRule;
    userRoles: Role[];
    permissions: string[];
}

const ProtectedRoute = ({ children, access, userRoles, permissions }: Props) => {
    if (
        !canAccess(
            {
                isAuthenticated: true,
                roles: userRoles,
                permissions,
            },
            access,
        )
    ) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
