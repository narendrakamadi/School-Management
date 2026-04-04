import { userApi, teacherApi, rolesApi, classesApi, sectionsApi } from "../api/endpoints/teacherApi";
import type { CreateUserPayload, User } from "../api/endpoints/teacherApi";
import type { CreateTeacherPayload, Teacher } from "../types/teacher";

/**
 * Teacher Service Layer
 * Provides high-level abstractions for teacher-related operations
 */

export const teacherService = {
    /**
     * Create a new teacher with user account in a two-step process
     * 1. Creates user account
     * 2. Creates teacher profile using the user_id
     */
    async createTeacherWithUser(
        userPayload: CreateUserPayload,
        teacherPayload: Omit<CreateTeacherPayload, "user_id">,
    ): Promise<{ user: User; teacher: Teacher }> {
        try {
            // Step 1: Create user account
            const user = await userApi.create(userPayload);

            if (!user.id) {
                throw new Error("User created but no ID returned");
            }

            // Step 2: Create teacher profile
            const teacher = await teacherApi.create({
                ...teacherPayload,
                user_id: user.id,
            });

            return { user, teacher };
        } catch (error) {
            // Re-throw with context
            if (error instanceof Error) {
                throw new Error(`Failed to create teacher: ${error.message}`);
            }
            throw error;
        }
    },

    /**
     * Get teacher by ID
     */
    async getTeacher(teacherId: number): Promise<Teacher> {
        return teacherApi.getById(teacherId);
    },

    /**
     * Get all teachers for a school or class
     */
    async getTeachers(schoolId?: number, classId?: number): Promise<Teacher[]> {
        return teacherApi.list(schoolId, classId);
    },

    /**
     * Update teacher details
     */
    async updateTeacher(teacherId: number, payload: Partial<CreateTeacherPayload>): Promise<Teacher> {
        return teacherApi.update(teacherId, payload);
    },

    /**
     * Delete a teacher
     */
    async deleteTeacher(teacherId: number): Promise<void> {
        return teacherApi.delete(teacherId);
    },
};

/**
 * Dropdown/Options Service Layer
 * Provides data for form dropdowns
 */

export const optionsService = {
    /**
     * Get available roles for teacher assignment
     */
    async getRoles(schoolId?: number) {
        return rolesApi.list(schoolId);
    },

    /**
     * Get classes for a school
     */
    async getClasses(schoolId: number) {
        return classesApi.list(schoolId);
    },

    /**
     * Get sections for a class
     */
    async getSections(classId: number) {
        return sectionsApi.list(classId);
    },

    /**
     * Get all options needed for the Add Teacher form
     */
    async getFormOptions(schoolId: number) {
        try {
            const [roles, classes] = await Promise.all([this.getRoles(schoolId), this.getClasses(schoolId)]);

            return {
                roles,
                classes,
                // sections will be fetched dynamically based on selected class
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to load form options: ${error.message}`);
            }
            throw error;
        }
    },
};

/**
 * User Service Layer
 * Provides user account management
 */

export const userService = {
    /**
     * Create a new user account
     */
    async createUser(payload: CreateUserPayload): Promise<User> {
        return userApi.create(payload);
    },

    /**
     * Get user by ID
     */
    async getUser(userId: number): Promise<User> {
        return userApi.getById(userId);
    },

    /**
     * Update user details
     */
    async updateUser(userId: number, payload: Partial<CreateUserPayload>): Promise<User> {
        return userApi.update(userId, payload);
    },
};

