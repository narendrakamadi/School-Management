import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormHelperText,
    Grid,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Avatar,
    Alert,
    Divider,
    FormControl,
    InputLabel,
    LinearProgress,
    InputAdornment,
    IconButton,
    Tooltip,
    Breadcrumbs,
    Link,
    Fade,
} from "@mui/material";
import {
    CloudUpload,
    CheckCircle,
    Close,
    PersonAdd,
    Visibility,
    VisibilityOff,
    ErrorOutline,
    NavigateNext,
    Person,
    Home,
    AccountCircle,
    WorkOutline,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { addTeacherSchema, type AddTeacherFormData } from "../teacherValidation";
import {
    useTeacherCreation,
    useFetchRoles,
    useFetchClasses,
    useFetchSections,
    useFetchDepartments,
} from "../../../hooks/useTeacher";
import { useSnackbar } from "../../../hooks/useSnackbar";
import type { CreateUserPayload } from "../../../api/endpoints/teacherApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const ACADEMIC_YEAR_OPTIONS = [
    { value: "2024-2025", label: "2024-2025" },
    { value: "2025-2026", label: "2025-2026" },
    { value: "2026-2027", label: "2026-2027" },
    { value: "2027-2028", label: "2027-2028" },
];

// ─── Password Strength ────────────────────────────────────────────────────────

const getPasswordStrength = (password: string) => {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    const colors = ["", "#f44336", "#ff9800", "#ffc107", "#4caf50", "#2e7d32"];
    return { score, label: labels[score], color: colors[score] };
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <Box display="flex" alignItems="center" gap={1} mb={2.5}>
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "#fff",
                flexShrink: 0,
            }}
        >
            {icon}
        </Box>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            {title}
        </Typography>
        <Box flex={1} height="1px" bgcolor="divider" ml={1} />
    </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AddTeacherPage = () => {
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const { createTeacher, loading: isSubmitting } = useTeacherCreation();

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<AddTeacherFormData>({
        resolver: zodResolver(addTeacherSchema),
        mode: "onBlur",
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
            employeeId: "",
            qualification: "",
            experienceYears: 0,
            salary: 0,
            departmentId: null as unknown as number,
            classId: null as unknown as number,
            sectionId: null as unknown as number,
            dateOfBirth: "",
            gender: "",
            joiningDate: "",
            academicYear: "",
            address: "",
            status: "active",
        },
    });

    const passwordValue = watch("password");
    const firstNameValue = watch("firstName");
    const lastNameValue = watch("lastName");
    const selectedClassId = watch("classId");
    const strength = getPasswordStrength(passwordValue ?? "");
    const initials = `${firstNameValue?.charAt(0) ?? ""}${lastNameValue?.charAt(0) ?? ""}`.toUpperCase();

    const { fetchRoles } = useFetchRoles();
    const { classes, loading: classesLoading, error: classesError, fetchClasses } = useFetchClasses();
    const { sections, loading: sectionsLoading, error: sectionsError, fetchSections } = useFetchSections();
    const {
        departments,
        loading: departmentsLoading,
        error: departmentsError,
        fetchDepartments,
    } = useFetchDepartments();

    useEffect(() => {
        fetchRoles(1);
        fetchClasses(1);
        fetchDepartments(1);
    }, [fetchRoles, fetchClasses, fetchDepartments]);

    useEffect(() => {
        if (selectedClassId && selectedClassId > 0) {
            setValue("sectionId", null as unknown as number);
            fetchSections(selectedClassId);
        }
    }, [selectedClassId, fetchSections, setValue]);

    const filteredSections = selectedClassId
        ? sections.filter((s) => s.class_id === selectedClassId)
        : [];

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showSnackbar("File size must be less than 5 MB", "error"); return; }
        if (!file.type.startsWith("image/")) { showSnackbar("Only image files are allowed", "error"); return; }
        const reader = new FileReader();
        reader.onload = (e) => setProfileImage(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const onSubmit = async (formData: AddTeacherFormData) => {
        setFormError(null);
        try {
            const userPayload: CreateUserPayload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                username: formData.username,
                password: formData.password,
                role_ids: [4],
                school_id: 1,
                is_super_admin: false,
            };
            const teacherPayload = {
                employee_id: formData.employeeId,
                qualification: formData.qualification,
                experience_years: formData.experienceYears,
                department_id: formData.departmentId || 0,
                joining_date: formData.joiningDate,
                salary: formData.salary,
                status: formData.status,
            };
            await createTeacher(userPayload, teacherPayload);
            showSnackbar(`Teacher "${formData.firstName} ${formData.lastName}" created successfully!`, "success");
            navigate("/teachers");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to create teacher. Please try again.";
            setFormError(msg);
            showSnackbar(msg, "error");
        }
    };

    return (
        <Box sx={{ width: "100%", py: 3, px: { xs: 2, sm: 3 } }}>

            {/* Breadcrumbs */}
            <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
                <Link
                    underline="hover"
                    color="inherit"
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 14 }}
                >
                    <Home fontSize="small" /> Home
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigate("/teachers"); }}
                    sx={{ fontSize: 14 }}
                >
                    Teachers
                </Link>
                <Typography color="text.primary" fontSize={14}>Add Teacher</Typography>
            </Breadcrumbs>

            {/* Page header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                    p: 3,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
                    color: "#fff",
                }}
            >
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 48, height: 48 }}>
                    <PersonAdd />
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Add New Teacher</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        Fill in the details below to create a new teacher account
                    </Typography>
                </Box>
            </Box>

            {/* Error Alert */}
            <Fade in={!!formError}>
                <Box mb={formError ? 3 : 0}>
                    {formError && (
                        <Alert
                            severity="error"
                            icon={<ErrorOutline />}
                            onClose={() => setFormError(null)}
                            sx={{ borderRadius: 2 }}
                        >
                            <Typography variant="body2" fontWeight={600}>Submission Failed</Typography>
                            <Typography variant="body2">{formError}</Typography>
                        </Alert>
                    )}
                </Box>
            </Fade>

            {/* Form card */}
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>

                        {/* ── Profile Photo ─────────────────────────────── */}
                        <Stack alignItems="center" spacing={1.5} mb={4}>
                            <Box sx={{ position: "relative" }}>
                                <Avatar
                                    src={profileImage ?? undefined}
                                    sx={{
                                        width: 96,
                                        height: 96,
                                        fontSize: 32,
                                        fontWeight: 700,
                                        bgcolor: "primary.main",
                                        border: "3px solid",
                                        borderColor: "primary.light",
                                    }}
                                >
                                    {!profileImage && (initials || <Person fontSize="large" />)}
                                </Avatar>
                                {profileImage && (
                                    <Tooltip title="Remove photo">
                                        <IconButton
                                            size="small"
                                            onClick={() => setProfileImage(null)}
                                            sx={{
                                                position: "absolute",
                                                top: -6,
                                                right: -6,
                                                bgcolor: "error.main",
                                                color: "#fff",
                                                "&:hover": { bgcolor: "error.dark" },
                                                width: 24,
                                                height: 24,
                                            }}
                                        >
                                            <Close sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<CloudUpload />}
                                component="label"
                                sx={{ borderRadius: 2 }}
                            >
                                Upload Photo
                                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                            </Button>
                            <Typography variant="caption" color="text.secondary">
                                JPG, PNG or GIF · Max 5 MB
                            </Typography>
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        {/* ── Section 1: Account Credentials ────────────── */}
                        <SectionHeader icon={<AccountCircle sx={{ fontSize: 18 }} />} title="Account Credentials" />

                        <Grid container spacing={2.5} mb={4}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="First Name *"
                                            placeholder="e.g. Priya"
                                            error={!!errors.firstName}
                                            helperText={errors.firstName?.message}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Last Name *"
                                            placeholder="e.g. Sharma"
                                            error={!!errors.lastName}
                                            helperText={errors.lastName?.message}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="email"
                                            label="Email Address *"
                                            placeholder="e.g. priya.sharma@school.edu"
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="username"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Username *"
                                            placeholder="e.g. priya.sharma"
                                            error={!!errors.username}
                                            helperText={errors.username?.message}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type={showPassword ? "text" : "password"}
                                            label="Password *"
                                            placeholder="Min 8 characters"
                                            error={!!errors.password}
                                            helperText={errors.password?.message}
                                            disabled={isSubmitting}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton size="small" onClick={() => setShowPassword((p) => !p)}>
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                />
                                {(passwordValue?.length ?? 0) > 0 && (
                                    <Box mt={0.75}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(strength.score / 5) * 100}
                                            sx={{
                                                height: 4,
                                                borderRadius: 2,
                                                bgcolor: "grey.200",
                                                "& .MuiLinearProgress-bar": { bgcolor: strength.color },
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600 }}>
                                            {strength.label}
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type={showConfirm ? "text" : "password"}
                                            label="Confirm Password *"
                                            placeholder="Re-enter your password"
                                            error={!!errors.confirmPassword}
                                            helperText={errors.confirmPassword?.message}
                                            disabled={isSubmitting}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton size="small" onClick={() => setShowConfirm((p) => !p)}>
                                                                {showConfirm ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {/* ── Section 2: Professional Details ───────────── */}
                        <SectionHeader icon={<WorkOutline sx={{ fontSize: 18 }} />} title="Professional Details" />

                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="employeeId"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Employee ID *"
                                            placeholder="e.g. EMP-001"
                                            error={!!errors.employeeId}
                                            helperText={errors.employeeId?.message}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="departmentId"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.departmentId}>
                                            <InputLabel>Department *</InputLabel>
                                            <Select
                                                {...field}
                                                value={field.value ?? ""}
                                                label="Department *"
                                                disabled={isSubmitting || departmentsLoading}
                                            >
                                                <MenuItem value=""><em>Select department</em></MenuItem>
                                                {departments.map((d) => (
                                                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                                                ))}
                                            </Select>
                                            {errors.departmentId && (
                                                <FormHelperText>{errors.departmentId.message}</FormHelperText>
                                            )}
                                            {!errors.departmentId && departmentsError && (
                                                <FormHelperText error>{departmentsError}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="qualification"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Qualification *"
                                            placeholder="e.g. M.Ed, B.Sc Mathematics"
                                            error={!!errors.qualification}
                                            helperText={errors.qualification?.message}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="experienceYears"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                field.onChange(v === "" ? "" : Number(v));
                                            }}
                                            fullWidth
                                            type="number"
                                            label="Experience (Years) *"
                                            error={!!errors.experienceYears}
                                            helperText={errors.experienceYears?.message}
                                            disabled={isSubmitting}
                                            slotProps={{ htmlInput: { min: 0, max: 60 } }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="salary"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                field.onChange(v === "" ? "" : Number(v));
                                            }}
                                            fullWidth
                                            type="number"
                                            label="Salary *"
                                            placeholder="e.g. 45000"
                                            error={!!errors.salary}
                                            helperText={errors.salary?.message}
                                            disabled={isSubmitting}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">INR</InputAdornment>
                                                    ),
                                                },
                                                htmlInput: { min: 0 },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="classId"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.classId}>
                                            <InputLabel>Assigned Class *</InputLabel>
                                            <Select
                                                {...field}
                                                value={field.value ?? ""}
                                                label="Assigned Class *"
                                                disabled={isSubmitting || classesLoading}
                                                endAdornment={
                                                    classesLoading
                                                        ? <CircularProgress size={16} sx={{ mr: 2 }} />
                                                        : null
                                                }
                                            >
                                                <MenuItem value=""><em>Select a class</em></MenuItem>
                                                {classes.map((c) => (
                                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                                ))}
                                            </Select>
                                            {errors.classId && (
                                                <FormHelperText>{errors.classId.message}</FormHelperText>
                                            )}
                                            {!errors.classId && classesError && (
                                                <FormHelperText error>{classesError}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="sectionId"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl
                                            fullWidth
                                            error={!!errors.sectionId}
                                            disabled={!selectedClassId}
                                        >
                                            <InputLabel>Section *</InputLabel>
                                            <Select
                                                {...field}
                                                value={field.value ?? ""}
                                                label="Section *"
                                                disabled={isSubmitting || sectionsLoading || !selectedClassId}
                                                endAdornment={
                                                    sectionsLoading
                                                        ? <CircularProgress size={16} sx={{ mr: 2 }} />
                                                        : null
                                                }
                                            >
                                                <MenuItem value="">
                                                    <em>
                                                        {selectedClassId
                                                            ? "Select a section"
                                                            : "Select a class first"}
                                                    </em>
                                                </MenuItem>
                                                {filteredSections.map((s) => (
                                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                                ))}
                                            </Select>
                                            {errors.sectionId && (
                                                <FormHelperText>{errors.sectionId.message}</FormHelperText>
                                            )}
                                            {!errors.sectionId && sectionsError && (
                                                <FormHelperText error>{sectionsError}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="dateOfBirth"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="date"
                                            label="Date of Birth *"
                                            error={!!errors.dateOfBirth}
                                            helperText={errors.dateOfBirth?.message}
                                            disabled={isSubmitting}
                                            slotProps={{
                                                inputLabel: { shrink: true },
                                                htmlInput: {
                                                    max: new Date().toISOString().split("T")[0],
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.gender}>
                                            <InputLabel>Gender *</InputLabel>
                                            <Select {...field} label="Gender *" disabled={isSubmitting}>
                                                <MenuItem value=""><em>Select gender</em></MenuItem>
                                                {GENDER_OPTIONS.map((o) => (
                                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                                ))}
                                            </Select>
                                            {errors.gender && (
                                                <FormHelperText>{errors.gender.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="joiningDate"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="date"
                                            label="Joining Date *"
                                            error={!!errors.joiningDate}
                                            helperText={errors.joiningDate?.message}
                                            disabled={isSubmitting}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="academicYear"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.academicYear}>
                                            <InputLabel>Academic Year *</InputLabel>
                                            <Select {...field} label="Academic Year *" disabled={isSubmitting}>
                                                <MenuItem value=""><em>Select academic year</em></MenuItem>
                                                {ACADEMIC_YEAR_OPTIONS.map((o) => (
                                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                                ))}
                                            </Select>
                                            {errors.academicYear && (
                                                <FormHelperText>{errors.academicYear.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.status}>
                                            <InputLabel>Status *</InputLabel>
                                            <Select {...field} label="Status *" disabled={isSubmitting}>
                                                {STATUS_OPTIONS.map((o) => (
                                                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                                ))}
                                            </Select>
                                            {errors.status && (
                                                <FormHelperText>{errors.status.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="address"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Address*"
                                            placeholder="House/Street, Area, City, State, ZIP"
                                            error={!!errors.address}
                                            helperText={errors.address?.message}
                                            disabled={isSubmitting}
                                            slotProps={{
                                                htmlInput: { maxLength: 200 },
                                            }}
                                            sx={{
                                                "& .MuiInputBase-inputMultiline": {
                                                    wordBreak: "break-word",
                                                    overflowWrap: "break-word",
                                                    whiteSpace: "pre-wrap",
                                                    resize: "none",
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {/* ── Actions ───────────────────────────────────── */}
                        <Divider sx={{ mt: 4, mb: 3 }} />
                        <Box display="flex" justifyContent="flex-end" gap={2}>
                            <Button
                                type="button"
                                variant="outlined"
                                startIcon={<Close />}
                                onClick={() => navigate("/teachers")}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="success"
                                disabled={isSubmitting}
                                startIcon={
                                    isSubmitting
                                        ? <CircularProgress size={18} color="inherit" />
                                        : <CheckCircle />
                                }
                                sx={{ minWidth: 160 }}
                            >
                                {isSubmitting ? "Creating…" : "Create Teacher"}
                            </Button>
                        </Box>

                    </form>
                </CardContent>
            </Card>

        </Box>
    );
};

export default AddTeacherPage;

