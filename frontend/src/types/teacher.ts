export interface Teacher {
    id: number;
    user_id: number;
    employee_id: string;
    qualification?: string | null;
    experience_years?: number | null;
    department_id?: number | null;
    joining_date?: string | null;
    salary?: number | null;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateTeacherPayload {
    user_id: number;
    employee_id: string;
    qualification?: string | null;
    experience_years?: number | null;
    department_id?: number | null;
    joining_date?: string | null;
    salary?: number | null;
    status: string;
}

export interface TeacherFormValues {
    // User Info
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;

    // Teacher Details
    employeeId: string;
    qualification: string;
    experienceYears: number;
    salary: number;
    departmentId: number | null;
    classId: number | null;
    sectionId: number | null;
    dateOfBirth: string;
    gender: string;
    joiningDate: string;
    academicYear: string;
    address: string;
    status: string;
}

export interface Department {
    id: number;
    name: string;
    school_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    school_id?: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface SchoolClass {
    id: number;
    name: string;
    school_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface Section {
    id: number;
    name: string;
    class_id: number;
    created_at?: string;
    updated_at?: string;
}

