import { Alert, Box, Button, Link, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Link as RouterLink,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useState } from "react";
import { AxiosError } from "axios";
import { loginSchema, type LoginFormData } from "../authValidation";
import { authApi } from "../../../api/endpoints/authApi";
import { useAppDispatch } from "../../../store/hooks";
import { setAcl, setCredentials } from "../authSlice";
import { extractAclFromLoginResponse, resolveAcl } from "../authService";

type LocationState = {
    from?: {
        pathname?: string;
    };
};

const LoginPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [apiError, setApiError] = useState("");

    const fromPath =
        (location.state as LocationState | null)?.from?.pathname ??
        "/dashboard";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
        mode: "onBlur",
    });

    const onSubmit = async (values: LoginFormData) => {
        setApiError("");

        try {
            const response = await authApi.login(values);
            const token = response.access_token ?? response.token;

            if (!token) {
                setApiError("Login succeeded but token was not returned.");
                return;
            }
            const initialAcl = extractAclFromLoginResponse(response);

            const firstName = response.user?.first_name;
            const lastName = response.user?.last_name;
            const fullNameFromParts =
                typeof firstName === "string" && typeof lastName === "string"
                    ? `${firstName} ${lastName}`.trim()
                    : undefined;

            dispatch(
                setCredentials({
                    token,
                    roles: initialAcl.roles,
                    permissions: initialAcl.permissions,
                    user: response.user
                        ? {
                            id: response.user.id,
                            fullName:
                                response.user.fullName ?? fullNameFromParts,
                            email: response.user.email,
                            username: response.user.username ?? values.username,
                        }
                        : { username: values.username },
                }),
            );

            void resolveAcl(response, token).then((freshAcl) => {
                dispatch(setAcl(freshAcl));
            });

            navigate(fromPath, { replace: true });
        } catch (error) {
            if (error instanceof AxiosError) {
                const errorData = error.response?.data as
                    | { message?: string; detail?: string }
                    | undefined;
                const message =
                    errorData?.message ??
                    errorData?.detail ??
                    "Invalid username or password.";
                setApiError(message);
                return;
            }

            setApiError("Something went wrong. Please try again.");
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
                <TextField
                    label="Username"
                    type="text"
                    autoComplete="username"
                    fullWidth
                    {...register("username")}
                    error={Boolean(errors.username)}
                    helperText={errors.username?.message}
                />

                <TextField
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    fullWidth
                    {...register("password")}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                />

                {Object.keys(errors).length > 0 ? (
                    <Alert severity="error">
                        Please fix the highlighted fields.
                    </Alert>
                ) : null}

                {apiError ? <Alert severity="error">{apiError}</Alert> : null}

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                >
                    Login
                </Button>

                <Link
                    component={RouterLink}
                    to="/register"
                    underline="hover"
                    sx={{ textAlign: "center" }}
                >
                    Don't have an account? Create one
                </Link>
            </Stack>
        </Box>
    );
};

export default LoginPage;
