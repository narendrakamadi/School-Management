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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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

interface SectionRow {
    id: string;
    classId: number;
    className: string;
    name: string;
}

const rowsPerPage = 10;

const validateSectionName = (value: string): string => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return "Section name is required";
    }
    if (trimmedValue.length < 1) {
        return "Section name must be at least 1 character";
    }
    return "";
};

const mapSectionToRow = (section: Section, className: string): SectionRow => ({
    id: String(section.id),
    classId: section.class_id,
    className,
    name: section.name,
});

const SectionsPage = () => {
    const { can } = usePermission();

    const [classRows, setClassRows] = useState<SchoolClass[]>([]);
    const [rows, setRows] = useState<SectionRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedClassId, setSelectedClassId] = useState<number | "">("");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);

    const [viewingSection, setViewingSection] = useState<SectionRow | null>(null);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editNameError, setEditNameError] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [addName, setAddName] = useState("");
    const [addNameError, setAddNameError] = useState("");
    const [addClassId, setAddClassId] = useState<number | "">("");
    const [addClassIdError, setAddClassIdError] = useState("");
    const [isCreatingSection, setIsCreatingSection] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchClasses = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const classes = await classApi.list(1);

                if (isMounted) {
                    setClassRows(classes);
                    if (classes.length > 0) {
                        setSelectedClassId(classes[0].id);
                    } else {
                        setSelectedClassId("");
                        setRows([]);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setClassRows([]);
                    setRows([]);
                    setError(err instanceof Error ? err.message : "Failed to fetch classes");
                }
            } finally {
                if (isMounted && classRows.length === 0) {
                    setIsLoading(false);
                }
            }
        };

        void fetchClasses();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedClassId) {
            setRows([]);
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const fetchSectionsByClass = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const sections = await sectionApi.list(selectedClassId);
                const className = classRows.find((row) => row.id === selectedClassId)?.name ?? "-";
                const mappedRows = sections.map((section) => mapSectionToRow(section, className));

                if (isMounted) {
                    setRows(mappedRows);
                }
            } catch (err) {
                if (isMounted) {
                    setRows([]);
                    setError(err instanceof Error ? err.message : "Failed to fetch sections");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchSectionsByClass();

        return () => {
            isMounted = false;
        };
    }, [selectedClassId, classRows]);

    const classScopedRows = useMemo(() => {
        if (!selectedClassId) {
            return [];
        }
        return rows.filter((row) => row.classId === selectedClassId);
    }, [rows, selectedClassId]);

    const filteredRows = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return classScopedRows;
        }

        return classScopedRows.filter(
            (row) =>
                row.id.toLowerCase().includes(query) ||
                row.name.toLowerCase().includes(query) ||
                row.className.toLowerCase().includes(query),
        );
    }, [classScopedRows, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

    useEffect(() => {
        const maxPage = Math.max(0, totalPages - 1);
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [page, totalPages]);

    const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleChangePage = (_event: ChangeEvent<unknown>, value: number) => {
        setPage(value - 1);
    };

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleView = async (sectionId: string) => {
        try {
            const section = await sectionApi.getById(Number(sectionId));
            const className = classRows.find((row) => row.id === section.class_id)?.name ?? "-";
            setViewingSection(mapSectionToRow(section, className));
        } catch {
            setError("Failed to load section details");
        }
    };

    const handleEditOpen = (row: SectionRow) => {
        setError(null);
        setEditingSectionId(row.id);
        setEditName(row.name);
        setEditNameError("");
    };

    const handleEditClose = () => {
        if (isSavingEdit) {
            return;
        }

        setEditingSectionId(null);
        setEditName("");
        setEditNameError("");
    };

    const handleEditSave = async () => {
        if (!editingSectionId || !selectedClassId) {
            return;
        }

        const nameError = validateSectionName(editName);
        setEditNameError(nameError);
        if (nameError) {
            return;
        }

        setIsSavingEdit(true);
        setError(null);

        try {
            const updatedSection = await sectionApi.update(Number(editingSectionId), {
                class_id: selectedClassId,
                name: editName.trim(),
            });

            const className = classRows.find((row) => row.id === updatedSection.class_id)?.name ?? "-";
            const updatedRow = mapSectionToRow(updatedSection, className);

            setRows((currentRows) =>
                currentRows.map((row) => (row.id === editingSectionId ? updatedRow : row)),
            );

            if (viewingSection?.id === editingSectionId) {
                setViewingSection(updatedRow);
            }

            handleEditClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update section");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDelete = async (sectionId: string) => {
        const hasConfirmed = window.confirm("Are you sure you want to delete this section?");
        if (!hasConfirmed) {
            return;
        }

        setError(null);

        try {
            await sectionApi.delete(Number(sectionId));
            setRows((currentRows) => currentRows.filter((row) => row.id !== sectionId));

            if (viewingSection?.id === sectionId) {
                setViewingSection(null);
            }

            if (editingSectionId === sectionId) {
                handleEditClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete section");
        }
    };

    const handleAddOpen = () => {
        if (!selectedClassId) {
            setAddClassIdError("Please select a class first");
            return;
        }

        setError(null);
        setIsAddDialogOpen(true);
        setAddNameError("");
        setAddClassIdError("");
        setAddClassId(selectedClassId);
    };

    const handleAddClose = () => {
        if (isCreatingSection) {
            return;
        }

        setIsAddDialogOpen(false);
        setAddName("");
        setAddNameError("");
        setAddClassId("");
        setAddClassIdError("");
    };

    const handleAddSave = async () => {
        const nameError = validateSectionName(addName);
        const classError = addClassId ? "" : "Class is required";

        setAddNameError(nameError);
        setAddClassIdError(classError);

        if (nameError || classError || !addClassId) {
            return;
        }

        setError(null);
        setIsCreatingSection(true);

        try {
            const createdSection = await sectionApi.create({
                class_id: addClassId,
                name: addName.trim(),
            });

            const className = classRows.find((row) => row.id === createdSection.class_id)?.name ?? "-";
            const createdRow = mapSectionToRow(createdSection, className);

            setRows((currentRows) => [createdRow, ...currentRows]);
            setSelectedClassId(addClassId);
            setPage(0);
            handleAddClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create section");
        } finally {
            setIsCreatingSection(false);
        }
    };

    const isAddFormInvalid = Boolean(validateSectionName(addName)) || !addClassId;
    const isEditFormInvalid = Boolean(validateSectionName(editName));

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
                <Typography variant="h5">Manage Sections</Typography>

                <Stack direction="row" spacing={1.5} alignItems="center">
                    <FormControl
                        size="small"
                        sx={{
                            minWidth: 220,
                            "& .MuiOutlinedInput-root": { height: 36 },
                        }}
                    >
                        <InputLabel id="section-class-filter-label">Class</InputLabel>
                        <Select
                            labelId="section-class-filter-label"
                            label="Class"
                            value={selectedClassId === "" ? "" : selectedClassId}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (typeof value === "number") {
                                    setSelectedClassId(value);
                                } else if (value === "") {
                                    setSelectedClassId("");
                                } else {
                                    setSelectedClassId(Number(value));
                                }
                                setSearchTerm("");
                                setPage(0);
                            }}
                        >
                            {classRows.length === 0 && <MenuItem value=""><em>No classes</em></MenuItem>}
                            {classRows.map((schoolClass) => (
                                <MenuItem key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        placeholder="Search sections"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{
                            width: { xs: 220, sm: 320, md: 380 },
                            "& .MuiOutlinedInput-root": { height: 36 },
                        }}
                        disabled={!selectedClassId}
                    />

                    {can("create_sections") && (
                        <Button variant="contained" onClick={handleAddOpen} disabled={!selectedClassId}>
                            Add Section
                        </Button>
                    )}
                </Stack>
            </Box>

            <TableContainer component={Paper}>
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
                                    Select a class to view and manage sections.
                                </StyledTableCell>
                            </StyledTableRow>
                        )}

                        {!isLoading && !error && selectedClassId && paginatedRows.length === 0 && (
                            <StyledTableRow>
                                <StyledTableCell colSpan={4} align="center">No sections found.</StyledTableCell>
                            </StyledTableRow>
                        )}

                        {!isLoading && !error && selectedClassId && paginatedRows.map((row) => (
                            <StyledTableRow key={row.id}>
                                <StyledTableCell component="th" scope="row" sx={{ width: 70 }}>
                                    {row.id}
                                </StyledTableCell>
                                <StyledTableCell>{row.className}</StyledTableCell>
                                <StyledTableCell>
                                    {editingSectionId === row.id ? (
                                        <TextField
                                            value={editName}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                setEditName(value);
                                                setEditNameError(validateSectionName(value));
                                            }}
                                            onBlur={() => {
                                                setEditNameError(validateSectionName(editName));
                                            }}
                                            size="small"
                                            fullWidth
                                            placeholder="Section name"
                                            error={Boolean(editNameError)}
                                            helperText={editNameError || undefined}
                                            sx={{
                                                "& .MuiOutlinedInput-root": { height: 36 },
                                            }}
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
                                                    void handleEditSave();
                                                }}
                                                disabled={isSavingEdit || isEditFormInvalid}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={handleEditClose}
                                                disabled={isSavingEdit}
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
                                                    void handleView(row.id);
                                                }}
                                                disabled={!can("read_sections")}
                                            >
                                                <VisibilityOutlinedIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                aria-label="edit section"
                                                onClick={() => {
                                                    handleEditOpen(row);
                                                }}
                                                disabled={!can("update_sections")}
                                            >
                                                <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                aria-label="delete section"
                                                onClick={() => {
                                                    void handleDelete(row.id);
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
                        count={totalPages}
                        page={page + 1}
                        onChange={handleChangePage}
                        shape="rounded"
                        variant="outlined"
                    />
                </Stack>
            </TableContainer>

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

            <Dialog open={isAddDialogOpen} onClose={handleAddClose} maxWidth="xs" fullWidth>
                <DialogTitle>Add Section</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 0.5 }}>
                        <FormControl fullWidth error={Boolean(addClassIdError)}>
                            <InputLabel id="add-section-class-label">Class</InputLabel>
                            <Select
                                labelId="add-section-class-label"
                                label="Class"
                                value={addClassId === "" ? "" : addClassId}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    if (typeof value === "number") {
                                        setAddClassId(value);
                                    } else if (value === "") {
                                        setAddClassId("");
                                    } else {
                                        setAddClassId(Number(value));
                                    }
                                    setAddClassIdError("");
                                }}
                            >
                                <MenuItem value=""><em>Select class</em></MenuItem>
                                {classRows.map((schoolClass) => (
                                    <MenuItem key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</MenuItem>
                                ))}
                            </Select>
                            {addClassIdError && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.75 }}>
                                    {addClassIdError}
                                </Typography>
                            )}
                        </FormControl>

                        <TextField
                            label="Section Name"
                            value={addName}
                            onChange={(event) => {
                                const value = event.target.value;
                                setAddName(value);
                                setAddNameError(validateSectionName(value));
                            }}
                            onBlur={() => {
                                setAddNameError(validateSectionName(addName));
                            }}
                            required
                            fullWidth
                            error={Boolean(addNameError)}
                            helperText={addNameError || " "}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddClose} disabled={isCreatingSection}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            void handleAddSave();
                        }}
                        disabled={isCreatingSection || isAddFormInvalid}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SectionsPage;

