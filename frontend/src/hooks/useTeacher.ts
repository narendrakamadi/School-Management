import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { userApi, teacherApi, rolesApi, classesApi, sectionsApi, departmentsApi } from "../api/endpoints/teacherApi";
import type { CreateUserPayload, User } from "../api/endpoints/teacherApi";
import type {
    CreateTeacherPayload,
    Teacher,
    Role,
    SchoolClass,
    Section,
    Department
}
from "../types";

interface TeacherCreationResponse {
    user: User;
    teacher: Teacher;
}

interface UseTeacherCreationState {
    loading: boolean;
    error: string | null;
    success: boolean;
}

export const useTeacherCreation = () => {
    const { user: currentUser } = useAuth();
    const [state, setState] = useState<UseTeacherCreationState>({
        loading: false,
        error: null,
        success: false,
    });

    const createTeacher = useCallback(
        async (
            userPayload: CreateUserPayload,
            teacherPayload: Omit<CreateTeacherPayload, "user_id">,
        ): Promise<TeacherCreationResponse> => {
            setState({ loading: true, error: null, success: false });

            try {
                // Step 1: Create User
                const createdUser = await userApi.create(userPayload);

                // Step 2: Create Teacher with the user_id from the created user
                const createdTeacher = await teacherApi.create({
                    ...teacherPayload,
                    user_id: createdUser.id,
                });

                setState({ loading: false, error: null, success: true });

                return {
                    user: createdUser,
                    teacher: createdTeacher,
                };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to create teacher";
                setState({ loading: false, error: errorMessage, success: false });
                throw err;
            }
        },
        [],
    );

    const resetState = useCallback(() => {
        setState({ loading: false, error: null, success: false });
    }, []);

    return {
        ...state,
        createTeacher,
        resetState,
        schoolId: currentUser?.id ? 1 : null, // Adjust based on your auth structure
    };
};

export const useFetchRoles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = useCallback(async (schoolId?: number) => {
        setLoading(true);
        setError(null);

        try {
            const data = await rolesApi.list(schoolId);
            setRoles(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch roles";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return { roles, loading, error, fetchRoles };
};

export const useFetchClasses = () => {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClasses = useCallback(async (schoolId: number) => {
        setLoading(true);
        setError(null);

        try {
            const data = await classesApi.list(schoolId);
            setClasses(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch classes";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return { classes, loading, error, fetchClasses };
};

export const useFetchSections = () => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSections = useCallback(async (classId: number) => {
        setLoading(true);
        setError(null);

        try {
            const data = await sectionsApi.list(classId);
            setSections(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch sections";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return { sections, loading, error, fetchSections };
};

export const useFetchDepartments = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDepartments = useCallback(async (schoolId?: number) => {
        setLoading(true);
        setError(null);

        try {
            const data = await departmentsApi.list(schoolId);
            setDepartments(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch departments";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return { departments, loading, error, fetchDepartments };
};

