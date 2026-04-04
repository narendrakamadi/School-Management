// Export all teacher-related types
export * from "./teacher";

// Export validation schemas
export { addTeacherSchema, type AddTeacherFormData } from "../features/teachers/teacherValidation";

// Export API functions
export { teacherApi, userApi, rolesApi, classesApi, sectionsApi } from "../api/endpoints/teacherApi";
export type { CreateUserPayload, User } from "../api/endpoints/teacherApi";

// Export custom hooks
export { useTeacherCreation, useFetchRoles, useFetchClasses, useFetchSections } from "../hooks/useTeacher";
export { useSnackbar } from "../hooks/useSnackbar";

// Export service layer
export { teacherService, optionsService, userService } from "../services/teacherService";

