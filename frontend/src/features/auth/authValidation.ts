import { z } from "zod";

export const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, "Username is required.")
        .min(3, "Username must be at least 3 characters."),
    password: z
        .string()
        .min(1, "Password is required.")
        .min(6, "Password must be at least 6 characters."),
});

export const registerSchema = z
    .object({
        fullName: z
            .string()
            .min(1, "Full name is required.")
            .min(2, "Full name must be at least 2 characters."),
        email: z
            .string()
            .min(1, "Email is required.")
            .email("Please enter a valid email address."),
        password: z
            .string()
            .min(1, "Password is required.")
            .min(6, "Password must be at least 6 characters."),
        confirmPassword: z.string().min(1, "Confirm password is required."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Password and confirm password do not match.",
        path: ["confirmPassword"],
    });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
