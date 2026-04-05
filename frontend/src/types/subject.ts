export interface Subject {
    id: number;
    name: string;
    code?: string | null;
}

export interface CreateSubjectPayload {
    name: string;
    code?: string | null;
}

export interface UpdateSubjectPayload {
    name?: string;
    code?: string | null;
}

