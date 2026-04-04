import { Alert, Box, Button, Link, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AUTH_STORAGE_KEY } from "../authTypes";
import { registerSchema, type RegisterFormData } from "../authValidation";

const RegisterPage = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onBlur",
    });

    const onSubmit = (values: RegisterFormData) => {
        localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({
                token: "demo-token",
                user: {
                    fullName: values.fullName,
                    email: values.email,
                },
            }),
        );

        navigate("/dashboard", { replace: true });
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
                <TextField
                    label="Full Name"
                    autoComplete="name"
                    fullWidth
                    {...register("fullName")}
                    error={Boolean(errors.fullName)}
                    helperText={errors.fullName?.message}
                />

                <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    fullWidth
                    {...register("email")}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                />

                <TextField
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    fullWidth
                    {...register("password")}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                />

                <TextField
                    label="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                    fullWidth
                    {...register("confirmPassword")}
                    error={Boolean(errors.confirmPassword)}
                    helperText={errors.confirmPassword?.message}
                />

                {Object.keys(errors).length > 0 ? (
                    <Alert severity="error">
                        Please fix the highlighted fields.
                    </Alert>
                ) : null}

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                >
                    Create Account
                </Button>

                <Link
                    component={RouterLink}
                    to="/login"
                    underline="hover"
                    sx={{ textAlign: "center" }}
                >
                    Already have an account? Login
                </Link>
            </Stack>
        </Box>
    );
};

export default RegisterPage;
