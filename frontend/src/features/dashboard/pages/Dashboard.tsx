import {
    Avatar,
    Box,
    Chip,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { RoleLabel, Roles } from "../../../types/roles";
import type { Role } from "../../../types/roles";
import { useAuth } from "../../../hooks/useAuth";
import type { JSX } from "react";

const getWelcomeName = (fullName?: string, username?: string, email?: string) => {
    const trimmedFullName = fullName?.trim();
    if (trimmedFullName) {
        return trimmedFullName.split(" ")[0];
    }

    const trimmedUsername = username?.trim();
    if (trimmedUsername) {
        return trimmedUsername;
    }

    const emailName = email?.split("@")[0]?.trim();
    return emailName || "there";
};

const createRolePanel = (title: string, description: string) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)",
        }}
    >
        <Stack spacing={1}>
            <Typography variant="h6" fontWeight={700}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
            <LinearProgress
                variant="determinate"
                value={68}
                sx={{ mt: 1.5, height: 8, borderRadius: 999 }}
            />
        </Stack>
    </Paper>
);

const Dashboard = () => {
    const { user, userRole } = useAuth();

    const welcomeName = getWelcomeName(user?.fullName, user?.username, user?.email);

    const roleMap: Record<Role, JSX.Element> = {
        [Roles.SUPER_ADMIN]: createRolePanel(
            "Super Admin Dashboard",
            "Track all schools, governance activity, and platform-wide health.",
        ),
        [Roles.SCHOOL_ADMIN]: createRolePanel(
            "School Admin Dashboard",
            "Manage staff, classes, and daily school operations efficiently.",
        ),
        [Roles.TEACHER]: createRolePanel(
            "Teacher Dashboard",
            "Manage attendance, assignments, and classroom performance.",
        ),
        [Roles.STUDENT]: createRolePanel(
            "Student Dashboard",
            "Review lessons, grades, and upcoming exam timelines.",
        ),
        [Roles.PARENT]: createRolePanel(
            "Parent Dashboard",
            "Stay updated on your child's progress, attendance, and notices.",
        ),
        [Roles.STAFF]: createRolePanel(
            "Staff Dashboard",
            "Organize operational tasks and monitor support workflows.",
        ),
    };

    return (
        <Stack spacing={2.5}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    color: "common.white",
                    background:
                        "linear-gradient(135deg, rgba(18,60,99,1) 0%, rgba(47,120,191,1) 100%)",
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                >
                    <Stack spacing={0.75}>
                        <Typography variant="h4" fontWeight={800}>
                            Welcome {welcomeName}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.92 }}>
                            Let's make today productive and keep everything on track.
                        </Typography>
                        <Chip
                            size="small"
                            label={`Role: ${userRole ? RoleLabel[userRole] : "Unknown role"}`}
                            sx={{
                                mt: 0.5,
                                width: "fit-content",
                                bgcolor: "rgba(255,255,255,0.16)",
                                color: "common.white",
                                border: "1px solid rgba(255,255,255,0.32)",
                            }}
                        />
                    </Stack>

                    <Avatar
                        sx={{
                            width: 64,
                            height: 64,
                            bgcolor: "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(255,255,255,0.4)",
                            fontSize: 24,
                            fontWeight: 700,
                        }}
                    >
                        {welcomeName.charAt(0).toUpperCase()}
                    </Avatar>
                </Stack>
            </Paper>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="body2" color="text.secondary">
                            Attendance Health
                        </Typography>
                        <Typography variant="h5" fontWeight={700} sx={{ mt: 0.75 }}>
                            94%
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="body2" color="text.secondary">
                            Pending Tasks
                        </Typography>
                        <Typography variant="h5" fontWeight={700} sx={{ mt: 0.75 }}>
                            07
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="body2" color="text.secondary">
                            New Announcements
                        </Typography>
                        <Typography variant="h5" fontWeight={700} sx={{ mt: 0.75 }}>
                            03
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Box>{userRole ? roleMap[userRole] : createRolePanel("Dashboard", "Your workspace is being prepared.")}</Box>
        </Stack>
    );
};

export default Dashboard;
