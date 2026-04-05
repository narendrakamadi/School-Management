import { styled } from "@mui/material/styles";
import {
    Typography,
    Box,
    Button,
    Stack,
    Paper,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { usePermission } from "../../../hooks/usePermission";
import { classApi, sectionApi } from "../../../api/endpoints/classSectionApi";
import type { SchoolClass, Section } from "../../../types/teacher";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));

interface ClassRow {
    id: string;
    name: string;
}

interface SectionRow {
    id: string;
    classId: number;
    className: string;
    name: string;
}

const rowsPerPage = 10;

const validateName = (value: string, label: string): string => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return `${label} name is required`;
    }
    if (trimmedValue.length < 2) {
        return `${label} name must be at least 2 characters`;
    }
    return "";
};

const mapClassToRow = (schoolClass: SchoolClass): ClassRow => ({
    id: String(schoolClass.id),
    name: schoolClass.name,
});

const mapSectionToRow = (section: Section, className: string): SectionRow => ({
    id: String(section.id),
    classId: section.class_id,
    className,
    name: section.name,
});

const ClassesSectionsPage = () => {
    const { can } = usePermission();

    const [classRows, setClassRows] = useState<ClassRow[]>([]);
    const [sectionRows, setSectionRows] = useState<SectionRow[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    const [classSearchTerm, setClassSearchTerm] = useState("");
    const [sectionSearchTerm, setSectionSearchTerm] = useState("");

    const [classPage, setClassPage] = useState(0);
    const [sectionPage, setSectionPage] = useState(0);

    const [viewingClass, setViewingClass] = useState<ClassRow | null>(null);
    const [viewingSection, setViewingSection] = useState<SectionRow | null>(null);

    const [editingClassId, setEditingClassId] = useState<string | null>(null);
    const [editClassName, setEditClassName] = useState("");
    const [editClassNameError, setEditClassNameError] = useState("");
    const [isSavingClassEdit, setIsSavingClassEdit] = useState(false);

    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editSectionName, setEditSectionName] = useState("");
    const [editSectionNameError, setEditSectionNameError] = useState("");
    const [isSavingSectionEdit, setIsSavingSectionEdit] = useState(false);

    const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
    const [addClassName, setAddClassName] = useState("");
    const [addClassNameError, setAddClassNameError] = useState("");
    const [isCreatingClass, setIsCreatingClass] = useState(false);

    const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
    const [addSectionName, setAddSectionName] = useState("");
    const [addSectionNameError, setAddSectionNameError] = useState("");
    const [isCreatingSection, setIsCreatingSection] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [classes, sections] = await Promise.all([classApi.list(), sectionApi.list()]);

                const classMap = new Map(classes.map((item) => [item.id, item.name]));
                const mappedClassRows = classes.map(mapClassToRow);
                const mappedSectionRows = sections.map((section) =>
                    mapSectionToRow(section, classMap.get(section.class_id) ?? "-"),
                );

                if (isMounted) {
                    setClassRows(mappedClassRows);
                    setSectionRows(mappedSectionRows);
                    if (mappedClassRows.length > 0) {
                        setSelectedClassId((current) => current ?? mappedClassRows[0].id);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setClassRows([]);
                    setSectionRows([]);
                    setError(err instanceof Error ? err.message : "Failed to fetch classes and sections");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredClassRows = useMemo(() => {
        const query = classSearchTerm.trim().toLowerCase();
        if (!query) {
            return classRows;
        }
        return classRows.filter((row) => row.id.toLowerCase().includes(query) || row.name.toLowerCase().includes(query));
    }, [classRows, classSearchTerm]);

    const selectedClassIdNumber = selectedClassId ? Number(selectedClassId) : null;

    const selectedSections = useMemo(() => {
        if (!selectedClassIdNumber) {
            return [];
        }
        return sectionRows.filter((row) => row.classId === selectedClassIdNumber);
    }, [sectionRows, selectedClassIdNumber]);

    const filteredSectionRows = useMemo(() => {
        const query = sectionSearchTerm.trim().toLowerCase();
        if (!query) {
            return selectedSections;
        }

        return selectedSections.filter((row) =>
            row.name.toLowerCase().includes(query) ||
            row.id.toLowerCase().includes(query) ||
            row.className.toLowerCase().includes(query),
        );
    }, [selectedSections, sectionSearchTerm]);

    const classTotalPages = Math.max(1, Math.ceil(filteredClassRows.length / rowsPerPage));
    const sectionTotalPages = Math.max(1, Math.ceil(filteredSectionRows.length / rowsPerPage));

    useEffect(() => {
        const maxPage = Math.max(0, classTotalPages - 1);
        if (classPage > maxPage) {
            setClassPage(maxPage);
        }
    }, [classPage, classTotalPages]);

    useEffect(() => {
        const maxPage = Math.max(0, sectionTotalPages - 1);
        if (sectionPage > maxPage) {
            setSectionPage(maxPage);
        }
    }, [sectionPage, sectionTotalPages]);

    const paginatedClassRows = filteredClassRows.slice(
        classPage * rowsPerPage,
        classPage * rowsPerPage + rowsPerPage,
    );

    const paginatedSectionRows = filteredSectionRows.slice(
        sectionPage * rowsPerPage,
        sectionPage * rowsPerPage + rowsPerPage,
    );

    const handleClassPageChange = (_event: ChangeEvent<unknown>, value: number) => {
        setClassPage(value - 1);
    };

    const handleSectionPageChange = (_event: ChangeEvent<unknown>, value: number) => {
        setSectionPage(value - 1);
    };

    const handleClassSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setClassSearchTerm(event.target.value);
        setClassPage(0);
    };

    const handleSectionSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSectionSearchTerm(event.target.value);
        setSectionPage(0);
    };

    const handleClassSelect = (classId: string) => {
        setSelectedClassId(classId);
        setSectionPage(0);
        setSectionSearchTerm("");
        setViewingSection(null);
        if (editingSectionId) {
            setEditingSectionId(null);
            setEditSectionName("");
            setEditSectionNameError("");
        }
    };

    const handleClassView = async (classId: string) => {
        try {
            const data = await classApi.getById(Number(classId));
            setViewingClass(mapClassToRow(data));
        } catch {
            setError("Failed to load class details");
        }
    };

    const handleSectionView = async (sectionId: string) => {
        try {
            const data = await sectionApi.getById(Number(sectionId));
            const className = classRows.find((row) => row.id === String(data.class_id))?.name ?? "-";
            setViewingSection(mapSectionToRow(data, className));
        } catch {
            setError("Failed to load section details");
        }
    };

    const handleClassEditOpen = (row: ClassRow) => {
        setError(null);
        setEditingClassId(row.id);
        setEditClassName(row.name);
        setEditClassNameError("");
    };

    const handleClassEditClose = () => {
        if (isSavingClassEdit) {
            return;
        }

        setEditingClassId(null);
        setEditClassName("");
        setEditClassNameError("");
    };

    const handleClassEditSave = async () => {
        if (!editingClassId) {
            return;
        }

        const nameError = validateName(editClassName, "Class");
        setEditClassNameError(nameError);
        if (nameError) {
            return;
        }

        setIsSavingClassEdit(true);
        setError(null);

        try {
            const updatedClass = await classApi.update(Number(editingClassId), {
                name: editClassName.trim(),
            });

            const updatedRow = mapClassToRow(updatedClass);
            setClassRows((currentRows) =>
                currentRows.map((row) => (row.id === editingClassId ? updatedRow : row)),
            );
            setSectionRows((currentRows) =>
                currentRows.map((row) =>
                    row.classId === updatedClass.id
                        ? { ...row, className: updatedClass.name }
                        : row,
                ),
            );

            if (viewingClass?.id === editingClassId) {
                setViewingClass(updatedRow);
            }

            if (viewingSection && viewingSection.classId === updatedClass.id) {
                setViewingSection({ ...viewingSection, className: updatedClass.name });
            }

            handleClassEditClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update class");
        } finally {
            setIsSavingClassEdit(false);
        }
    };

    const handleSectionEditOpen = (row: SectionRow) => {
        setError(null);
        setEditingSectionId(row.id);
        setEditSectionName(row.name);
        setEditSectionNameError("");
    };

    const handleSectionEditClose = () => {
        if (isSavingSectionEdit) {
            return;
        }

        setEditingSectionId(null);
        setEditSectionName("");
        setEditSectionNameError("");
    };

    const handleSectionEditSave = async () => {
        if (!editingSectionId || !selectedClassIdNumber) {
            return;
        }

        const nameError = validateName(editSectionName, "Section");
        setEditSectionNameError(nameError);
        if (nameError) {
            return;
        }

        setIsSavingSectionEdit(true);
        setError(null);

        try {
            const updatedSection = await sectionApi.update(Number(editingSectionId), {
                class_id: selectedClassIdNumber,
                name: editSectionName.trim(),
            });

            const className = classRows.find((row) => row.id === String(updatedSection.class_id))?.name ?? "-";
            const updatedRow = mapSectionToRow(updatedSection, className);

            setSectionRows((currentRows) =>
                currentRows.map((row) => (row.id === editingSectionId ? updatedRow : row)),
            );

            if (viewingSection?.id === editingSectionId) {
                setViewingSection(updatedRow);
            }

            handleSectionEditClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update section");
        } finally {
            setIsSavingSectionEdit(false);
        }
    };

    const handleClassDelete = async (classId: string) => {
        const hasConfirmed = window.confirm("Are you sure you want to delete this class?");
        if (!hasConfirmed) {
            return;
        }

        setError(null);

        try {
            await classApi.delete(Number(classId));

            setClassRows((currentRows) => currentRows.filter((row) => row.id !== classId));
            setSectionRows((currentRows) =>
                currentRows.filter((row) => row.classId !== Number(classId)),
            );

            if (selectedClassId === classId) {
                const nextRow = classRows.find((row) => row.id !== classId);
                setSelectedClassId(nextRow?.id ?? null);
            }

            if (viewingClass?.id === classId) {
                setViewingClass(null);
            }

            if (viewingSection?.classId === Number(classId)) {
                setViewingSection(null);
            }

            if (editingClassId === classId) {
                handleClassEditClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete class");
        }
    };

    const handleSectionDelete = async (sectionId: string) => {
        const hasConfirmed = window.confirm("Are you sure you want to delete this section?");
        if (!hasConfirmed) {
            return;
        }

        setError(null);

        try {
            await sectionApi.delete(Number(sectionId));
            setSectionRows((currentRows) =>
                currentRows.filter((row) => row.id !== sectionId),
            );

            if (viewingSection?.id === sectionId) {
                setViewingSection(null);
            }

            if (editingSectionId === sectionId) {
                handleSectionEditClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete section");
        }
    };

    const handleClassAddOpen = () => {
        setError(null);
        setIsAddClassDialogOpen(true);
        setAddClassNameError("");
    };

    const handleClassAddClose = () => {
        if (isCreatingClass) {
            return;
        }

        setIsAddClassDialogOpen(false);
        setAddClassName("");
        setAddClassNameError("");
    };

    const handleClassAddSave = async () => {
        const nameError = validateName(addClassName, "Class");
        setAddClassNameError(nameError);
        if (nameError) {
            return;
        }

        setError(null);
        setIsCreatingClass(true);

        try {
            const createdClass = await classApi.create({
                name: addClassName.trim(),
            });

            const createdRow = mapClassToRow(createdClass);
            setClassRows((currentRows) => [createdRow, ...currentRows]);
            setClassPage(0);
            setSelectedClassId(createdRow.id);
            handleClassAddClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create class");
        } finally {
            setIsCreatingClass(false);
        }
    };

    const handleSectionAddOpen = () => {
        if (!selectedClassIdNumber) {
            return;
        }

        setError(null);
        setIsAddSectionDialogOpen(true);
        setAddSectionNameError("");
    };

    const handleSectionAddClose = () => {
        if (isCreatingSection) {
            return;
        }

        setIsAddSectionDialogOpen(false);
        setAddSectionName("");
        setAddSectionNameError("");
    };

    const handleSectionAddSave = async () => {
        if (!selectedClassIdNumber) {
            return;
        }

        const nameError = validateName(addSectionName, "Section");
        setAddSectionNameError(nameError);
        if (nameError) {
            return;
        }

        setError(null);
        setIsCreatingSection(true);

        try {
            const createdSection = await sectionApi.create({
                class_id: selectedClassIdNumber,
                name: addSectionName.trim(),
            });

            const className = classRows.find((row) => row.id === String(selectedClassIdNumber))?.name ?? "-";
            const createdRow = mapSectionToRow(createdSection, className);

            setSectionRows((currentRows) => [createdRow, ...currentRows]);
            setSectionPage(0);
            handleSectionAddClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create section");
        } finally {
            setIsCreatingSection(false);
        }
    };

    const isAddClassFormInvalid = Boolean(validateName(addClassName, "Class"));
    const isEditClassFormInvalid = Boolean(validateName(editClassName, "Class"));
    const isAddSectionFormInvalid = Boolean(validateName(addSectionName, "Section"));
    const isEditSectionFormInvalid = Boolean(validateName(editSectionName, "Section"));

    return (
        <Box>
            <Typography variant="h5" mb={2}>Manage Classes & Sections</Typography>

            <Stack spacing={3}>
                <Paper sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
                        <Typography variant="h6">Classes</Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Search classes"
                                value={classSearchTerm}
                                onChange={handleClassSearchChange}
                                sx={{
                                    width: { xs: 220, sm: 320, md: 380 },
                                    "& .MuiOutlinedInput-root": { height: 36 },
                                }}
                            />
                            {can("create_classes") && (
                                <Button variant="contained" onClick={handleClassAddOpen}>Add Class</Button>
                            )}
                        </Stack>
                    </Box>

                    <TableContainer>
                        <Table sx={{ minWidth: 700 }} aria-label="classes table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell sx={{ width: 70 }}>ID</StyledTableCell>
                                    <StyledTableCell>Name</StyledTableCell>
                                    <StyledTableCell align="right" sx={{ width: 180 }}>Actions</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading && (
                                    <StyledTableRow>
                                        <StyledTableCell colSpan={3} align="center">Loading classes...</StyledTableCell>
                                    </StyledTableRow>
                                )}

                                {!isLoading && error && (
                                    <StyledTableRow>
                                        <StyledTableCell colSpan={3} align="center">{error}</StyledTableCell>
                                    </StyledTableRow>
                                )}

                                {!isLoading && !error && paginatedClassRows.length === 0 && (
                                    <StyledTableRow>
                                        <StyledTableCell colSpan={3} align="center">No classes found.</StyledTableCell>
                                    </StyledTableRow>
                                )}

                                {!isLoading && !error && paginatedClassRows.map((row) => {
                                    const isSelected = selectedClassId === row.id;
                                    return (
                                        <StyledTableRow
                                            key={row.id}
                                            onClick={() => {
                                                handleClassSelect(row.id);
                                            }}
                                            sx={{
                                                cursor: "pointer",
                                                outline: isSelected ? (theme) => `1px solid ${theme.palette.primary.main}` : "none",
                                            }}
                                        >
                                            <StyledTableCell component="th" scope="row" sx={{ width: 70 }}>
                                                {row.id}
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {editingClassId === row.id ? (
                                                    <TextField
                                                        value={editClassName}
                                                        onChange={(event) => {
                                                            const value = event.target.value;
                                                            setEditClassName(value);
                                                            setEditClassNameError(validateName(value, "Class"));
                                                        }}
                                                        onBlur={() => {
                                                            setEditClassNameError(validateName(editClassName, "Class"));
                                                        }}
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Class name"
                                                        error={Boolean(editClassNameError)}
                                                        helperText={editClassNameError || " "}
                                                    />
                                                ) : (
                                                    row.name
                                                )}
                                            </StyledTableCell>
                                            <StyledTableCell align="right" onClick={(event) => event.stopPropagation()}>
                                                {editingClassId === row.id ? (
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={() => {
                                                                void handleClassEditSave();
                                                            }}
                                                            disabled={isSavingClassEdit || isEditClassFormInvalid}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={handleClassEditClose}
                                                            disabled={isSavingClassEdit}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </Stack>
                                                ) : (
                                                    <>
                                                        <IconButton
                                                            size="small"
                                                            aria-label="view class"
                                                            onClick={() => {
                                                                void handleClassView(row.id);
                                                            }}
                                                            disabled={!can("read_classes")}
                                                        >
                                                            <VisibilityOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            aria-label="edit class"
                                                            onClick={() => {
                                                                handleClassEditOpen(row);
                                                            }}
                                                            disabled={!can("update_classes")}
                                                        >
                                                            <EditOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            aria-label="delete class"
                                                            onClick={() => {
                                                                void handleClassDelete(row.id);
                                                            }}
                                                            disabled={!can("delete_classes")}
                                                        >
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        <Stack
                            spacing={2}
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                            }}
                            direction="row"
                            justifyContent="flex-end"
                            alignItems="center"
                        >
                            <Pagination
                                count={classTotalPages}
                                page={classPage + 1}
                                onChange={handleClassPageChange}
                                shape="rounded"
                                variant="outlined"
                            />
                        </Stack>
                    </TableContainer>
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
                        <Typography variant="h6">
                            Sections {selectedClassId ? `for Class #${selectedClassId}` : ""}
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Search sections"
                                value={sectionSearchTerm}
                                onChange={handleSectionSearchChange}
                                sx={{
                                    width: { xs: 220, sm: 320, md: 380 },
                                    "& .MuiOutlinedInput-root": { height: 36 },
                                }}
                                disabled={!selectedClassId}
                            />
                            {can("create_sections") && (
                                <Button
                                    variant="contained"
                                    onClick={handleSectionAddOpen}
                                    disabled={!selectedClassId}
                                >
                                    Add Section
                                </Button>
                            )}
                        </Stack>
                    </Box>

                    <TableContainer>
                        <Table sx={{ minWidth: 700 }} aria-label="sections table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell sx={{ width: 70 }}>ID</StyledTableCell>
                                    <StyledTableCell>Class</StyledTableCell>
                                    <StyledTableCell>Name</StyledTableCell>
                                    <StyledTableCell align="right" sx={{ width: 180 }}>Actions</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading && (
                                    <StyledTableRow>
                                        <StyledTableCell colSpan={4} align="center">Loading sections...</StyledTableCell>
                                    </StyledTableRow>
                                )}

                                {!isLoading && error && (
                                    <StyledTableRow>
                                        <StyledTableCell colSpan={4} align="center">{error}</StyledTableCell>
                                    </StyledTableRow>
                                )}

                                {!isLoading && !error && !selectedClassId && (
                                    <StyledTableRow>
                                        <StyledTableCell colSpan={4} align="center">
                                            Select a class first to view sections.
                                        </StyledTableCell>
                                    </StyledTableRow>
                                )}

                                {!isLoading && !error && selectedClassId && paginatedSectionRows.length === 0 && (
                                    <StyledTableRow>
                                        <StyledTableCell colSpan={4} align="center">No sections found.</StyledTableCell>
                                    </StyledTableRow>
                                )}

                                {!isLoading && !error && selectedClassId && paginatedSectionRows.map((row) => (
                                    <StyledTableRow key={row.id}>
                                        <StyledTableCell component="th" scope="row" sx={{ width: 70 }}>
                                            {row.id}
                                        </StyledTableCell>
                                        <StyledTableCell>{row.className}</StyledTableCell>
                                        <StyledTableCell>
                                            {editingSectionId === row.id ? (
                                                <TextField
                                                    value={editSectionName}
                                                    onChange={(event) => {
                                                        const value = event.target.value;
                                                        setEditSectionName(value);
                                                        setEditSectionNameError(validateName(value, "Section"));
                                                    }}
                                                    onBlur={() => {
                                                        setEditSectionNameError(validateName(editSectionName, "Section"));
                                                    }}
                                                    size="small"
                                                    fullWidth
                                                    placeholder="Section name"
                                                    error={Boolean(editSectionNameError)}
                                                    helperText={editSectionNameError || " "}
                                                />
                                            ) : (
                                                row.name
                                            )}
                                        </StyledTableCell>
                                        <StyledTableCell align="right">
                                            {editingSectionId === row.id ? (
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() => {
                                                            void handleSectionEditSave();
                                                        }}
                                                        disabled={isSavingSectionEdit || isEditSectionFormInvalid}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={handleSectionEditClose}
                                                        disabled={isSavingSectionEdit}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Stack>
                                            ) : (
                                                <>
                                                    <IconButton
                                                        size="small"
                                                        aria-label="view section"
                                                        onClick={() => {
                                                            void handleSectionView(row.id);
                                                        }}
                                                        disabled={!can("read_sections")}
                                                    >
                                                        <VisibilityOutlinedIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        aria-label="edit section"
                                                        onClick={() => {
                                                            handleSectionEditOpen(row);
                                                        }}
                                                        disabled={!can("update_sections")}
                                                    >
                                                        <EditOutlinedIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        aria-label="delete section"
                                                        onClick={() => {
                                                            void handleSectionDelete(row.id);
                                                        }}
                                                        disabled={!can("delete_sections")}
                                                    >
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </>
                                            )}
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Stack
                            spacing={2}
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                            }}
                            direction="row"
                            justifyContent="flex-end"
                            alignItems="center"
                        >
                            <Pagination
                                count={sectionTotalPages}
                                page={sectionPage + 1}
                                onChange={handleSectionPageChange}
                                shape="rounded"
                                variant="outlined"
                            />
                        </Stack>
                    </TableContainer>
                </Paper>
            </Stack>

            <Dialog open={Boolean(viewingClass)} onClose={() => setViewingClass(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Class Details</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1}>
                        <Typography variant="body2"><strong>ID:</strong> {viewingClass?.id}</Typography>
                        <Typography variant="body2"><strong>Name:</strong> {viewingClass?.name}</Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewingClass(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(viewingSection)} onClose={() => setViewingSection(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Section Details</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1}>
                        <Typography variant="body2"><strong>ID:</strong> {viewingSection?.id}</Typography>
                        <Typography variant="body2"><strong>Class:</strong> {viewingSection?.className}</Typography>
                        <Typography variant="body2"><strong>Name:</strong> {viewingSection?.name}</Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewingSection(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isAddClassDialogOpen} onClose={handleClassAddClose} maxWidth="xs" fullWidth>
                <DialogTitle>Add Class</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 0.5 }}>
                        <TextField
                            label="Class Name"
                            value={addClassName}
                            onChange={(event) => {
                                const value = event.target.value;
                                setAddClassName(value);
                                setAddClassNameError(validateName(value, "Class"));
                            }}
                            onBlur={() => {
                                setAddClassNameError(validateName(addClassName, "Class"));
                            }}
                            required
                            fullWidth
                            error={Boolean(addClassNameError)}
                            helperText={addClassNameError || " "}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClassAddClose} disabled={isCreatingClass}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            void handleClassAddSave();
                        }}
                        disabled={isCreatingClass || isAddClassFormInvalid}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isAddSectionDialogOpen} onClose={handleSectionAddClose} maxWidth="xs" fullWidth>
                <DialogTitle>Add Section</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 0.5 }}>
                        <TextField
                            label="Section Name"
                            value={addSectionName}
                            onChange={(event) => {
                                const value = event.target.value;
                                setAddSectionName(value);
                                setAddSectionNameError(validateName(value, "Section"));
                            }}
                            onBlur={() => {
                                setAddSectionNameError(validateName(addSectionName, "Section"));
                            }}
                            required
                            fullWidth
                            error={Boolean(addSectionNameError)}
                            helperText={addSectionNameError || " "}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSectionAddClose} disabled={isCreatingSection}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            void handleSectionAddSave();
                        }}
                        disabled={isCreatingSection || isAddSectionFormInvalid || !selectedClassId}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClassesSectionsPage;

