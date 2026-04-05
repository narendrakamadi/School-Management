import type { AccessRule } from "./acl";

export interface AppMenuItem {
    key: string;
    label: string;
    to?: string;
    access?: AccessRule;
}

export const appMenuItems: AppMenuItem[] = [
    { key: "dashboard", label: "Dashboard", to: "/dashboard" },
    {
        key: "students",
        label: "Students",
        to: "/students",
        access: { anyPermissions: ["read_students"] },
    },
    {
        key: "teachers",
        label: "Teachers",
        to: "/teachers",
        access: { anyPermissions: ["read_teachers"] },
    },
    {
        key: "staff",
        label: "Staff",
        to: "/staff",
        access: { anyPermissions: ["read_staff"] },
    },
    {
        key: "classes",
        label: "Classes",
        to: "/classes",
        access: { anyPermissions: ["read_classes"] },
    },
    {
        key: "sections",
        label: "Sections",
        to: "/sections",
        access: { anyPermissions: ["read_sections"] },
    },
    {
        key: "subjects",
        label: "Subjects",
        to: "/subjects",
        access: { anyPermissions: ["read_subjects"] },
    },
    {
        key: "attendance",
        label: "Attendance",
        access: { anyPermissions: ["read_attendance"] },
    },
    {
        key: "exams-results",
        label: "Exams & Results",
        access: { anyPermissions: ["read_exams", "read_marks"] },
    },
    {
        key: "fees-management",
        label: "Fees Management",
        access: { anyPermissions: ["read_fees"] },
    },
    {
        key: "timetable",
        label: "Timetable",
        access: { anyPermissions: ["read_teacher_assignments"] },
    },
    {
        key: "announcements",
        label: "Announcements",
        access: { anyPermissions: ["read_menus"] },
    },
    {
        key: "reports",
        label: "Reports",
        access: {
            anyPermissions: [
                "read_students",
                "read_teachers",
                "read_staff",
                "read_payments",
            ],
        },
    },
    {
        key: "settings",
        label: "Settings",
        access: {
            anyPermissions: ["read_roles", "read_permissions", "read_menus"],
        },
    },
];
