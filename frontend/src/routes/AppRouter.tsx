import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { routes } from "./routeConfig";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";

const LoginPage = React.lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = React.lazy(
    () => import("../features/auth/pages/RegisterPage"),
);

const AppRouter = () => {
    const { isAuthenticated, userRoles, permissions, aclLoaded } = useAuth();

    return (
        <Suspense
            fallback={
                <Box
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <CircularProgress color="primary" />
                </Box>
            }
        >
            <Routes>
                <Route
                    path="/"
                    element={
                        <Navigate
                            to={isAuthenticated ? "/dashboard" : "/login"}
                            replace
                        />
                    }
                />

                <Route
                    path="/login"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <AuthLayout>
                                <LoginPage />
                            </AuthLayout>
                        )
                    }
                />

                <Route
                    path="/register"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <AuthLayout>
                                <RegisterPage />
                            </AuthLayout>
                        )
                    }
                />

                {routes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={
                            !isAuthenticated ? (
                                <Navigate to="/login" replace />
                            ) : !aclLoaded ? (
                                <Box
                                    sx={{
                                        minHeight: "100vh",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <CircularProgress color="primary" />
                                </Box>
                            ) : (
                                <ProtectedRoute
                                    userRoles={userRoles}
                                    permissions={permissions}
                                    access={route.access}
                                >
                                    <MainLayout>
                                        <route.element />
                                    </MainLayout>
                                </ProtectedRoute>
                            )
                        }
                    />
                ))}

                <Route path="/unauthorized" element={<div>Unauthorized</div>} />
                <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
        </Suspense>
    );
};

export default AppRouter;
