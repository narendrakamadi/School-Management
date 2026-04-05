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
import { subjectApi } from "../../../api/endpoints/subjectApi";
import type { Subject } from "../../../types/subject";

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

interface SubjectRow {
    id: string;
    name: string;
    code: string;
}

const validateSubjectName = (value: string): string => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return "Subject name is required";
    }
    if (trimmedValue.length < 2) {
        return "Subject name must be at least 2 characters";
    }
    return "";
};

const validateSubjectCode = (value: string): string => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return "";
    }
    if (!/^[A-Za-z0-9_-]{2,20}$/.test(trimmedValue)) {
        return "Use 2-20 letters, numbers, '_' or '-'";
    }
    return "";
};

const mapSubjectToRow = (subject: Subject): SubjectRow => ({
    id: String(subject.id),
    name: subject.name,
    code: subject.code ?? "-",
});

const SubjectsPage = () => {
    const { can } = usePermission();

    const [rows, setRows] = useState<SubjectRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);

    const [viewingSubject, setViewingSubject] = useState<SubjectRow | null>(null);
    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editCode, setEditCode] = useState("");
    const [editNameError, setEditNameError] = useState("");
    const [editCodeError, setEditCodeError] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [addName, setAddName] = useState("");
    const [addCode, setAddCode] = useState("");
    const [addNameError, setAddNameError] = useState("");
    const [addCodeError, setAddCodeError] = useState("");
    const [isCreatingSubject, setIsCreatingSubject] = useState(false);

    const rowsPerPage = 10;

    useEffect(() => {
        let isMounted = true;

        const fetchSubjects = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const subjects = await subjectApi.list();
                const mappedRows = subjects.map(mapSubjectToRow);

                if (isMounted) {
                    setRows(mappedRows);
                }
            } catch (err) {
                if (isMounted) {
                    setRows([]);
                    setError(err instanceof Error ? err.message : "Failed to fetch subjects");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchSubjects();

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
            (row) =>
                row.name.toLowerCase().includes(query) ||
                row.code.toLowerCase().includes(query),
        );
    }, [rows, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

    useEffect(() => {
        const maxPage = Math.max(0, totalPages - 1);
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [page, totalPages]);

    const paginatedRows = filteredRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
    );

    const handleChangePage = (_event: ChangeEvent<unknown>, value: number) => {
        setPage(value - 1);
    };

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleView = async (subjectId: string) => {
        try {
            const subject = await subjectApi.getById(Number(subjectId));
            setViewingSubject(mapSubjectToRow(subject));
        } catch {
            setError("Failed to load subject details");
        }
    };

    const handleEditOpen = (row: SubjectRow) => {
        setError(null);
        setEditingSubjectId(row.id);
        setEditName(row.name);
        setEditCode(row.code === "-" ? "" : row.code);
        setEditNameError("");
        setEditCodeError("");
    };

    const handleEditClose = () => {
        if (isSavingEdit) {
            return;
        }

        setEditingSubjectId(null);
        setEditName("");
        setEditCode("");
        setEditNameError("");
        setEditCodeError("");
    };

    const handleEditSave = async () => {
        if (!editingSubjectId) {
            return;
        }

        const nameError = validateSubjectName(editName);
        const codeError = validateSubjectCode(editCode);
        setEditNameError(nameError);
        setEditCodeError(codeError);
        if (nameError || codeError) {
            return;
        }

        const trimmedName = editName.trim();

        setIsSavingEdit(true);
        setError(null);

        try {
            const updatedSubject = await subjectApi.update(Number(editingSubjectId), {
                name: trimmedName,
                code: editCode.trim() || null,
            });

            const updatedRow = mapSubjectToRow(updatedSubject);

            setRows((currentRows) =>
                currentRows.map((row) =>
                    row.id === editingSubjectId ? updatedRow : row,
                ),
            );

            setEditingSubjectId(null);
            setEditName("");
            setEditCode("");
            setEditNameError("");
            setEditCodeError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update subject");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDelete = async (subjectId: string) => {
        const hasConfirmed = window.confirm(
            "Are you sure you want to delete this subject?",
        );

        if (!hasConfirmed) {
            return;
        }

        setError(null);

        try {
            await subjectApi.delete(Number(subjectId));
            setRows((currentRows) =>
                currentRows.filter((row) => row.id !== subjectId),
            );

            if (viewingSubject?.id === subjectId) {
                setViewingSubject(null);
            }

            if (editingSubjectId === subjectId) {
                handleEditClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete subject");
        }
    };

    const handleAddOpen = () => {
        setError(null);
        setIsAddDialogOpen(true);
        setAddNameError("");
        setAddCodeError("");
    };

    const handleAddClose = () => {
        if (isCreatingSubject) {
            return;
        }

        setIsAddDialogOpen(false);
        setAddName("");
        setAddCode("");
        setAddNameError("");
        setAddCodeError("");
    };

    const handleAddSave = async () => {
        const nameError = validateSubjectName(addName);
        const codeError = validateSubjectCode(addCode);
        setAddNameError(nameError);
        setAddCodeError(codeError);
        if (nameError || codeError) {
            return;
        }

        const trimmedName = addName.trim();

        setError(null);
        setIsCreatingSubject(true);

        try {
            const createdSubject = await subjectApi.create({
                name: trimmedName,
                code: addCode.trim() || null,
            });

            const createdRow = mapSubjectToRow(createdSubject);
            setRows((currentRows) => [createdRow, ...currentRows]);
            setPage(0);
            setIsAddDialogOpen(false);
            setAddName("");
            setAddCode("");
            setAddNameError("");
            setAddCodeError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create subject");
        } finally {
            setIsCreatingSubject(false);
        }
    };

    const isAddFormInvalid =
        Boolean(validateSubjectName(addName)) || Boolean(validateSubjectCode(addCode));
    const isEditFormInvalid =
        Boolean(validateSubjectName(editName)) || Boolean(validateSubjectCode(editCode));

    return (
        <Box>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                gap={2}
            >
                <Typography variant="h5">Manage Subjects</Typography>

                <Stack direction="row" spacing={1.5} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search by name or code"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{
                            width: { xs: 220, sm: 320, md: 380 },
                            "& .MuiOutlinedInput-root": {
                                height: 36,
                            },
                        }}
                    />
                    {can("create_subjects") && (
                        <Button variant="contained" onClick={handleAddOpen}>Add Subject</Button>
                    )}
                </Stack>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="subjects table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: 70 }}>ID</StyledTableCell>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Code</StyledTableCell>
                            <StyledTableCell align="right" sx={{ width: 180 }}>
                                Actions
                            </StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading && (
                            <StyledTableRow>
                                <StyledTableCell colSpan={4} align="center">
                                    Loading subjects...
                                </StyledTableCell>
                            </StyledTableRow>
                        )}

                        {!isLoading && error && (
                            <StyledTableRow>
                                <StyledTableCell colSpan={4} align="center">
                                    {error}
                                </StyledTableCell>
                            </StyledTableRow>
                        )}

                        {!isLoading && !error && paginatedRows.length === 0 && (
                            <StyledTableRow>
                                <StyledTableCell colSpan={4} align="center">
                                    No subjects found.
                                </StyledTableCell>
                            </StyledTableRow>
                        )}

                        {!isLoading &&
                            !error &&
                            paginatedRows.map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell component="th" scope="row" sx={{ width: 70 }}>
                                        {row.id}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {editingSubjectId === row.id ? (
                                            <TextField
                                                value={editName}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    setEditName(value);
                                                    setEditNameError(validateSubjectName(value));
                                                }}
                                                onBlur={() => {
                                                    setEditNameError(validateSubjectName(editName));
                                                }}
                                                size="small"
                                                fullWidth
                                                placeholder="Subject name"
                                                error={Boolean(editNameError)}
                                                helperText={editNameError || " "}
                                            />
                                        ) : (
                                            row.name
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {editingSubjectId === row.id ? (
                                            <TextField
                                                value={editCode}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    setEditCode(value);
                                                    setEditCodeError(validateSubjectCode(value));
                                                }}
                                                onBlur={() => {
                                                    setEditCodeError(validateSubjectCode(editCode));
                                                }}
                                                size="small"
                                                fullWidth
                                                placeholder="Subject code"
                                                error={Boolean(editCodeError)}
                                                helperText={editCodeError || " "}
                                            />
                                        ) : (
                                            row.code
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        {editingSubjectId === row.id ? (
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
                                                    aria-label="view subject"
                                                    onClick={() => {
                                                        void handleView(row.id);
                                                    }}
                                                    disabled={!can("read_subjects")}
                                                >
                                                    <VisibilityOutlinedIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    aria-label="edit subject"
                                                    onClick={() => {
                                                        handleEditOpen(row);
                                                    }}
                                                    disabled={!can("update_subjects")}
                                                >
                                                    <EditOutlinedIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    aria-label="delete subject"
                                                    onClick={() => {
                                                        void handleDelete(row.id);
                                                    }}
                                                    disabled={!can("delete_subjects")}
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
                        sx={(theme) => ({
                            "& .MuiPaginationItem-root": {
                                borderRadius: 2,
                                borderColor: theme.palette.divider,
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                            },
                            "& .MuiPaginationItem-root:hover": {
                                backgroundColor: theme.palette.action.hover,
                            },
                            "& .MuiPaginationItem-root.Mui-selected": {
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                borderColor: theme.palette.primary.main,
                            },
                            "& .MuiPaginationItem-root.Mui-selected:hover": {
                                backgroundColor: theme.palette.primary.dark,
                            },
                            "& .MuiPaginationItem-root.Mui-disabled": {
                                color: theme.palette.action.disabled,
                                borderColor: theme.palette.action.disabledBackground,
                            },
                        })}
                    />
                </Stack>
            </TableContainer>

            <Dialog open={Boolean(viewingSubject)} onClose={() => setViewingSubject(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Subject Details</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1}>
                        <Typography variant="body2">
                            <strong>ID:</strong> {viewingSubject?.id}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Name:</strong> {viewingSubject?.name}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Code:</strong> {viewingSubject?.code}
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewingSubject(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isAddDialogOpen} onClose={handleAddClose} maxWidth="xs" fullWidth>
                <DialogTitle>Add Subject</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 0.5 }}>
                        <TextField
                            label="Subject Name"
                            value={addName}
                            onChange={(event) => {
                                const value = event.target.value;
                                setAddName(value);
                                setAddNameError(validateSubjectName(value));
                            }}
                            onBlur={() => {
                                setAddNameError(validateSubjectName(addName));
                            }}
                            required
                            fullWidth
                            error={Boolean(addNameError)}
                            helperText={addNameError || " "}
                        />
                        <TextField
                            label="Subject Code"
                            value={addCode}
                            onChange={(event) => {
                                const value = event.target.value;
                                setAddCode(value);
                                setAddCodeError(validateSubjectCode(value));
                            }}
                            onBlur={() => {
                                setAddCodeError(validateSubjectCode(addCode));
                            }}
                            fullWidth
                            error={Boolean(addCodeError)}
                            helperText={addCodeError || " "}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddClose} disabled={isCreatingSubject}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            void handleAddSave();
                        }}
                        disabled={isCreatingSubject || isAddFormInvalid}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default SubjectsPage;

