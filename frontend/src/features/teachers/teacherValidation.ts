import { z } from "zod";

// Password validation schema
const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)");

export const addTeacherSchema = z
    .object({
        // User Information
        firstName: z
            .string()
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name must not exceed 50 characters")
            .regex(/^[a-zA-Z\s-']+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),

        lastName: z
            .string()
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name must not exceed 50 characters")
            .regex(/^[a-zA-Z\s-']+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),

        email: z
            .string()
            .email("Invalid email address")
            .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),

        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must not exceed 30 characters")
            .regex(
                /^[a-zA-Z0-9._-]+$/,
                "Username can only contain letters, numbers, dots, hyphens, and underscores",
            ),

        password: passwordSchema,

        confirmPassword: z.string(),

        // Teacher Details
        employeeId: z
            .string()
            .min(1, "Employee ID is required")
            .max(50, "Employee ID must not exceed 50 characters"),

        qualification: z
            .string()
            .min(2, "Qualification is required")
            .max(100, "Qualification must not exceed 100 characters"),

        experienceYears: z
            .number()
            .min(0, "Experience cannot be negative")
            .max(60, "Experience seems too high"),

        salary: z
            .number()
            .min(0, "Salary cannot be negative"),

        departmentId: z
            .number()
            .int("Please select a valid department")
            .positive("Please select a valid department"),

        classId: z
            .number()
            .int("Please select a valid class")
            .positive("Please select a valid class"),

        sectionId: z
            .number()
            .int("Please select a valid section")
            .positive("Please select a valid section"),

        dateOfBirth: z
            .string()
            .refine((date) => {
                const birthDate = new Date(date);
                const age = new Date().getFullYear() - birthDate.getFullYear();
                return age >= 18 && age <= 80;
            }, "Teacher must be between 18 and 80 years old"),

        gender: z
            .string()
            .min(1, "Gender is required")
            .refine((gender) => ["Male", "Female", "Other"].includes(gender), "Invalid gender selection"),

        joiningDate: z.string().min(1, "Joining date is required"),

        academicYear: z
            .string()
            .min(1, "Academic year is required")
            .regex(/^\d{4}-\d{4}$/, "Academic year must be in YYYY-YYYY format (e.g., 2025-2026)"),

        address: z
            .string()
            .min(5, "Address must be at least 5 characters")
            .max(200, "Address must not exceed 200 characters"),

        status: z
            .string()
            .min(1, "Status is required")
            .refine((status) => ["active", "inactive"].includes(status), "Invalid status selection"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type AddTeacherFormData = z.infer<typeof addTeacherSchema>;

