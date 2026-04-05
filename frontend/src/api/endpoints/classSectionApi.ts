import { axiosInstance } from "../axiosInstance";
import type {
    SchoolClass,
    Section,
    CreateSchoolClassPayload,
    UpdateSchoolClassPayload,
    CreateSectionPayload,
    UpdateSectionPayload,
} from "../../types/teacher";

export const classApi = {
    create: async (payload: CreateSchoolClassPayload): Promise<SchoolClass> => {
        const { data } = await axiosInstance.post<SchoolClass>("/classes", payload);
        return data;
    },

    list: async (schoolId?: number): Promise<SchoolClass[]> => {
        const params = schoolId ? { school_id: schoolId } : {};
        const { data } = await axiosInstance.get<SchoolClass[]>("/classes", { params });
        return data;
    },

    getById: async (classId: number): Promise<SchoolClass> => {
        const { data } = await axiosInstance.get<SchoolClass>(`/classes/${classId}`);
        return data;
    },

    update: async (
        classId: number,
        payload: UpdateSchoolClassPayload,
    ): Promise<SchoolClass> => {
        const { data } = await axiosInstance.put<SchoolClass>(`/classes/${classId}`, payload);
        return data;
    },

    delete: async (classId: number): Promise<void> => {
        await axiosInstance.delete(`/classes/${classId}`);
    },
};

export const sectionApi = {
    create: async (payload: CreateSectionPayload): Promise<Section> => {
        const { data } = await axiosInstance.post<Section>("/sections", payload);
        return data;
    },
    selectedClassId: number
    list: async (classId?: number): Promise<Section[]> => {
        const params = classId ? { class_id: classId } : {};
        const { data } = await axiosInstance.get<Section[]>("/sections", { params });
        return data;
    },

    getById: async (sectionId: number): Promise<Section> => {
        const { data } = await axiosInstance.get<Section>(`/sections/${sectionId}`);
        return data;
    },

    update: async (
        sectionId: number,
        payload: UpdateSectionPayload,
    ): Promise<Section> => {
        const { data } = await axiosInstance.put<Section>(`/sections/${sectionId}`, payload);
        return data;
    },

    delete: async (sectionId: number): Promise<void> => {
        await axiosInstance.delete(`/sections/${sectionId}`);
    },
};
