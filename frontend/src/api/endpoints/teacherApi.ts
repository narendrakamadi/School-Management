import { axiosInstance } from "../axiosInstance";
import type { Teacher, CreateTeacherPayload, Role, SchoolClass, Section, Department } from "../../types/teacher";

export interface CreateUserPayload {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
    role_ids: number[];
    school_id: number;
    is_super_admin: boolean;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    phone?: string | null;
    phone_number?: string | null;
    mobile?: string | null;
    role_ids: number[];
    school_id: number;
    is_super_admin: boolean;
    created_at?: string;
    updated_at?: string;
}

// User API
export const userApi = {
    create: async (payload: CreateUserPayload): Promise<User> => {
        const { data } = await axiosInstance.post<User>("/users", payload);
        return data;
    },

    getById: async (userId: number): Promise<User> => {
        const { data } = await axiosInstance.get<User>(`/users/${userId}`);
        return data;
    },

    update: async (userId: number, payload: Partial<CreateUserPayload>): Promise<User> => {
        const { data } = await axiosInstance.put<User>(`/users/${userId}`, payload);
        return data;
    },
};

// Teacher API
export const teacherApi = {
    create: async (payload: CreateTeacherPayload): Promise<Teacher> => {
        const { data } = await axiosInstance.post<Teacher>("/teachers", payload);
        return data;
    },

    getById: async (teacherId: number): Promise<Teacher> => {
        const { data } = await axiosInstance.get<Teacher>(`/teachers/${teacherId}`);
        return data;
    },

    list: async (schoolId?: number, classId?: number): Promise<Teacher[]> => {
        const params = new URLSearchParams();
        if (schoolId) params.append("school_id", String(schoolId));
        if (classId) params.append("class_id", String(classId));

        const { data } = await axiosInstance.get<Teacher[]>("/teachers", {
            params,
        });
        return data;
    },

    update: async (teacherId: number, payload: Partial<CreateTeacherPayload>): Promise<Teacher> => {
        const { data } = await axiosInstance.put<Teacher>(`/teachers/${teacherId}`, payload);
        return data;
    },

    delete: async (teacherId: number): Promise<void> => {
        await axiosInstance.delete(`/teachers/${teacherId}`);
    },
};

// Roles API
export const rolesApi = {
    list: async (schoolId?: number): Promise<Role[]> => {
        const params = schoolId ? { school_id: schoolId } : {};
        const { data } = await axiosInstance.get<Role[]>("/roles", { params });
        return data;
    },

    getById: async (roleId: number): Promise<Role> => {
        const { data } = await axiosInstance.get<Role>(`/roles/${roleId}`);
        return data;
    },
};

// Classes API
export const classesApi = {
    list: async (schoolId: number): Promise<SchoolClass[]> => {
        const { data } = await axiosInstance.get<SchoolClass[]>("/classes", {
            params: { school_id: schoolId },
        });
        return data;
    },

    getById: async (classId: number): Promise<SchoolClass> => {
        const { data } = await axiosInstance.get<SchoolClass>(`/classes/${classId}`);
        return data;
    },
};

// Sections API
export const sectionsApi = {
    list: async (classId: number): Promise<Section[]> => {
        const { data } = await axiosInstance.get<Section[]>("/sections", {
            params: { class_id: classId },
        });
        return data;
    },

    getById: async (sectionId: number): Promise<Section> => {
        const { data } = await axiosInstance.get<Section>(`/sections/${sectionId}`);
        return data;
    },
};

// Departments API
export const departmentsApi = {
    list: async (schoolId?: number): Promise<Department[]> => {
        const params = schoolId ? { school_id: schoolId } : {};
        const { data } = await axiosInstance.get<Department[]>("/departments", { params });
        return data;
    },
};

