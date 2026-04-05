import { axiosInstance } from "../axiosInstance";
import type {
    Subject,
    CreateSubjectPayload,
    UpdateSubjectPayload,
} from "../../types/subject";

export const subjectApi = {
    create: async (payload: CreateSubjectPayload): Promise<Subject> => {
        const { data } = await axiosInstance.post<Subject>("/subjects", payload);
        return data;
    },

    list: async (): Promise<Subject[]> => {
        const { data } = await axiosInstance.get<Subject[]>("/subjects");
        return data;
    },

    getById: async (subjectId: number): Promise<Subject> => {
        const { data } = await axiosInstance.get<Subject>(`/subjects/${subjectId}`);
        return data;
    },

    update: async (
        subjectId: number,
        payload: UpdateSubjectPayload,
    ): Promise<Subject> => {
        const { data } = await axiosInstance.put<Subject>(
            `/subjects/${subjectId}`,
            payload,
        );
        return data;
    },

    delete: async (subjectId: number): Promise<void> => {
        await axiosInstance.delete(`/subjects/${subjectId}`);
    },
};

