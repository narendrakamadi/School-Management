import { Box, Stack, Typography } from "@mui/material";
import { RoleLabel, Roles } from "../../../types/roles";
import type { Role } from "../../../types/roles";
import { useAuth } from "../../../hooks/useAuth";
import type { JSX } from "react";

const Dashboard = () => {
    const { user, userRole } = useAuth();

    const roleMap: Record<Role, JSX.Element> = {
        [Roles.SUPER_ADMIN]: <div>Super Admin Dashboard</div>,
        [Roles.SCHOOL_ADMIN]: <div>School Admin Dashboard</div>,
        [Roles.TEACHER]: <div>Teacher Dashboard</div>,
        [Roles.STUDENT]: <div>Student Dashboard</div>,
        [Roles.PARENT]: <div>Parent Dashboard</div>,
        [Roles.STAFF]: <div>Staff Dashboard</div>,
    };

    const displayName =
        user?.fullName ?? user?.username ?? user?.email ?? "Unknown user";

    return (
        <Box>
            <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="h5">Welcome, {displayName}</Typography>
                <Typography variant="body1">
                    Role: {userRole ? RoleLabel[userRole] : "Unknown role"}
                </Typography>
            </Stack>

            {userRole ? roleMap[userRole] : <div>Default Dashboard</div>}
        </Box>
    );
};

export default Dashboard;
