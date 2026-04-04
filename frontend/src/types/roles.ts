// Roles constant (runtime-safe)
export const Roles = {
    SUPER_ADMIN: "SUPER_ADMIN",
    SCHOOL_ADMIN: "SCHOOL_ADMIN",
    TEACHER: "TEACHER",
    STUDENT: "STUDENT",
    PARENT: "PARENT",
    STAFF: "STAFF",
} as const;

// Role type (derived from Roles)
export type Role = (typeof Roles)[keyof typeof Roles];

const ROLE_ALIASES: Record<string, Role> = {
    superadmin: Roles.SUPER_ADMIN,
    super_admin: Roles.SUPER_ADMIN,
    admin: Roles.SCHOOL_ADMIN,
    school_admin: Roles.SCHOOL_ADMIN,
    teacher: Roles.TEACHER,
    student: Roles.STUDENT,
    parent: Roles.PARENT,
    staff: Roles.STAFF,
};

// Role labels (for UI)
export const RoleLabel: Record<Role, string> = {
    SUPER_ADMIN: "Super Admin",
    SCHOOL_ADMIN: "School Admin",
    TEACHER: "Teacher",
    STUDENT: "Student",
    PARENT: "Parent",
    STAFF: "Staff",
};

// Helper function
export const hasRole = (userRole: Role, allowedRoles: Role[]): boolean => {
    return allowedRoles.includes(userRole);
};

export const normalizeRole = (value: unknown): Role | null => {
    if (typeof value !== "string") {
        return null;
    }

    const directMatch = Object.values(Roles).find((role) => role === value);
    if (directMatch) {
        return directMatch;
    }

    return ROLE_ALIASES[value.trim().toLowerCase()] ?? null;
};

export const normalizeRoles = (values: unknown): Role[] => {
    if (!Array.isArray(values)) {
        return [];
    }

    const uniqueRoles = new Set<Role>();
    values.forEach((value) => {
        const role = normalizeRole(value);
        if (role) {
            uniqueRoles.add(role);
        }
    });

    return Array.from(uniqueRoles);
};

