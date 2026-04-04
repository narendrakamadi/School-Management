import { Box, Container, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                background:
                    "linear-gradient(135deg, rgba(18,60,99,0.08) 0%, rgba(18,60,99,0.16) 100%)",
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={4} sx={{ p: { xs: 3, sm: 4 } }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        School Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Welcome back. Please continue with your account.
                    </Typography>
                    {children}
                </Paper>
            </Container>
        </Box>
    );
};

export default AuthLayout;
