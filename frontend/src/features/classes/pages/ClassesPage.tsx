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
import { classApi } from "../../../api/endpoints/classSectionApi";
import type { SchoolClass } from "../../../types/teacher";

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

const rowsPerPage = 10;

const validateClassName = (value: string): string => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return "Class name is required";
    }
    if (trimmedValue.length < 2) {
        return "Class name must be at least 2 characters";
    }
    return "";
};

const mapClassToRow = (schoolClass: SchoolClass): ClassRow => ({
    id: String(schoolClass.id),
    name: schoolClass.name,
});

const ClassesPage = () => {
    const { can } = usePermission();

    const [rows, setRows] = useState<ClassRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);

    const [viewingClass, setViewingClass] = useState<ClassRow | null>(null);
    const [editingClassId, setEditingClassId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editNameError, setEditNameError] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [addName, setAddName] = useState("");
    const [addNameError, setAddNameError] = useState("");
    const [isCreatingClass, setIsCreatingClass] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchClasses = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const classes = await classApi.list(1);
                const mappedRows = classes.map(mapClassToRow);

                if (isMounted) {
                    setRows(mappedRows);
                }
            } catch (err) {
                if (isMounted) {
                    setRows([]);
                    setError(err instanceof Error ? err.message : "Failed to fetch classes");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchClasses();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredRows = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return rows;
        }

        return rows.filter(
            (row) => row.id.toLowerCase().includes(query) || row.name.toLowerCase().includes(query),
        );
    }, [rows, searchTerm]);

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

    const handleView = async (classId: string) => {
        try {
            const schoolClass = await classApi.getById(Number(classId));
            setViewingClass(mapClassToRow(schoolClass));
        } catch {
            setError("Failed to load class details");
        }
    };

    const handleEditOpen = (row: ClassRow) => {
        setError(null);
        setEditingClassId(row.id);
        setEditName(row.name);
        setEditNameError("");
    };

    const handleEditClose = () => {
        if (isSavingEdit) {
            return;
        }
        setEditingClassId(null);
        setEditName("");
        setEditNameError("");
    };

    const handleEditSave = async () => {
        if (!editingClassId) {
            return;
        }

        const nameError = validateClassName(editName);
        setEditNameError(nameError);
        if (nameError) {
            return;
        }

        setIsSavingEdit(true);
        setError(null);

        try {
            const updatedClass = await classApi.update(Number(editingClassId), { name: editName.trim() });
            const updatedRow = mapClassToRow(updatedClass);

            setRows((currentRows) =>
                currentRows.map((row) => (row.id === editingClassId ? updatedRow : row)),
            );

            if (viewingClass?.id === editingClassId) {
                setViewingClass(updatedRow);
            }

            handleEditClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update class");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDelete = async (classId: string) => {
        const hasConfirmed = window.confirm("Are you sure you want to delete this class?");
        if (!hasConfirmed) {
            return;
        }

        setError(null);

        try {
            await classApi.delete(Number(classId));
            setRows((currentRows) => currentRows.filter((row) => row.id !== classId));

            if (viewingClass?.id === classId) {
                setViewingClass(null);
            }

            if (editingClassId === classId) {
                handleEditClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete class");
        }
    };

    const handleAddOpen = () => {
        setError(null);
        setIsAddDialogOpen(true);
        setAddNameError("");
    };

    const handleAddClose = () => {
        if (isCreatingClass) {
            return;
        }

        setIsAddDialogOpen(false);
        setAddName("");
        setAddNameError("");
    };

    const handleAddSave = async () => {
        const nameError = validateClassName(addName);
        setAddNameError(nameError);
        if (nameError) {
            return;
        }

        setError(null);
        setIsCreatingClass(true);

        try {
            const createdClass = await classApi.create({ name: addName.trim() });
            const createdRow = mapClassToRow(createdClass);

            setRows((currentRows) => [createdRow, ...currentRows]);
            setPage(0);
            handleAddClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create class");
        } finally {
            setIsCreatingClass(false);
        }
    };

    const isAddFormInvalid = Boolean(validateClassName(addName));
    const isEditFormInvalid = Boolean(validateClassName(editName));

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
                <Typography variant="h5">Manage Classes</Typography>

                <Stack direction="row" spacing={1.5} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search classes"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{
                            width: { xs: 220, sm: 320, md: 380 },
                            "& .MuiOutlinedInput-root": { height: 36 },
                        }}
                    />
                    {can("create_classes") && (
                        <Button variant="contained" onClick={handleAddOpen}>Add Class</Button>
                    )}
                </Stack>
            </Box>

            <TableContainer component={Paper}>
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

                        {!isLoading && !error && paginatedRows.length === 0 && (
                            <StyledTableRow>
                                <StyledTableCell colSpan={3} align="center">No classes found.</StyledTableCell>
                            </StyledTableRow>
                        )}

                        {!isLoading && !error && paginatedRows.map((row) => (
                            <StyledTableRow key={row.id}>
                                <StyledTableCell component="th" scope="row" sx={{ width: 70 }}>
                                    {row.id}
                                </StyledTableCell>
                                <StyledTableCell>
                                    {editingClassId === row.id ? (
                                        <TextField
                                            value={editName}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                setEditName(value);
                                                setEditNameError(validateClassName(value));
                                            }}
                                            onBlur={() => {
                                                setEditNameError(validateClassName(editName));
                                            }}
                                            size="small"
                                            fullWidth
                                            placeholder="Class name"
                                            error={Boolean(editNameError)}
                                            helperText={editNameError || " "}
                                        />
                                    ) : (
                                        row.name
                                    )}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                    {editingClassId === row.id ? (
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
                                                aria-label="view class"
                                                onClick={() => {
                                                    void handleView(row.id);
                                                }}
                                                disabled={!can("read_classes")}
                                            >
                                                <VisibilityOutlinedIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                aria-label="edit class"
                                                onClick={() => {
                                                    handleEditOpen(row);
                                                }}
                                                disabled={!can("update_classes")}
                                            >
                                                <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                aria-label="delete class"
                                                onClick={() => {
                                                    void handleDelete(row.id);
                                                }}
                                                disabled={!can("delete_classes")}
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

            <Dialog open={isAddDialogOpen} onClose={handleAddClose} maxWidth="xs" fullWidth>
                <DialogTitle>Add Class</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 0.5 }}>
                        <TextField
                            label="Class Name"
                            value={addName}
                            onChange={(event) => {
                                const value = event.target.value;
                                setAddName(value);
                                setAddNameError(validateClassName(value));
                            }}
                            onBlur={() => {
                                setAddNameError(validateClassName(addName));
                            }}
                            required
                            fullWidth
                            error={Boolean(addNameError)}
                            helperText={addNameError || " "}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddClose} disabled={isCreatingClass}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            void handleAddSave();
                        }}
                        disabled={isCreatingClass || isAddFormInvalid}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClassesPage;

