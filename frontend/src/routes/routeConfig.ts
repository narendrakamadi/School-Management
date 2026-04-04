import React from "react";
import type { AccessRule } from "../config/acl";
import type { ComponentType } from "react";

export interface AppRoute {
    path: string;
    element: React.LazyExoticComponent<ComponentType>;
    access?: AccessRule;
}

export const routes: AppRoute[] = [
    {
        path: "/dashboard",
        element: React.lazy(
            () => import("../features/dashboard/pages/Dashboard"),
        ),
    },
    {
        path: "/students",
        element: React.lazy(
            () => import("../features/students/pages/StudentsPage"),
        ),
        access: { anyPermissions: ["read_students"] },
    },
    {
        path: "/teachers",
        element: React.lazy(
            () => import("../features/teachers/pages/TeachersPage"),
        ),
        access: { anyPermissions: ["read_teachers"] },
    },
    {
        path: "/teachers/add",
        element: React.lazy(
            () => import("../features/teachers/pages/AddTeacher") as Promise<{ default: ComponentType }>
        ),
        access: { anyPermissions: ["create_teachers"] },
    },
    {
        path: "/staff",
        element: React.lazy(
            () => import("../features/staff/pages/StaffPage"),
        ),
        access: { anyPermissions: ["read_staff"] },
    },
];
