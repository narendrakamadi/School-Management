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
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";
import { teacherApi, userApi } from "../../../api/endpoints/teacherApi";

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

function createData(
    id: string,
    employeeId: string,
    name: string,
    email: string,
    username: string,
    phone: string,
    status: string,
) {
    return { id, employeeId, name, email, username, phone, status };
}

const TeachersPage = () => {
    const navigate = useNavigate();
    const { can } = usePermission();

    const [rows, setRows] = useState<ReturnType<typeof createData>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

    useEffect(() => {
        let isMounted = true;

        const fetchTeachers = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const teachers = await teacherApi.list();
                const users = await Promise.all(
                    teachers.map(async (teacher) => {
                        try {
                            return await userApi.getById(teacher.user_id);
                        } catch {
                            return null;
                        }
                    }),
                );

                const mappedRows = teachers.map((teacher, index) => {
                    const user = users[index];
                    console.log(user)
                    const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
                    const phone = user?.phone ?? "-";

                    return createData(
                        String(teacher.id),
                        teacher.employee_id || "-",
                        fullName || "-",
                        user?.email ?? "-",
                        user?.username ?? "-",
                        phone,
                        teacher.status || "-",
                    );
                });

                if (isMounted) {
                    setRows(mappedRows);
                }
            } catch (err) {
                if (isMounted) {
                    setRows([]);
                    setError(err instanceof Error ? err.message : "Failed to fetch teachers");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchTeachers();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const maxPage = Math.max(0, totalPages - 1);
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [page, totalPages]);

    const handleChangePage = (_event: ChangeEvent<unknown>, value: number) => {
        setPage(value - 1);
    };

    const handleAddTeacher = () => {
        navigate("/teachers/add");
    };

    const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
            >
                <Typography variant="h5">Manage Teachers</Typography>

                {can("create_teachers") && (
                    <Button variant="contained" onClick={handleAddTeacher}>
                        Add Teacher
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: 50 }}>ID</StyledTableCell>
                            <StyledTableCell>Employee ID</StyledTableCell>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Email</StyledTableCell>
                            <StyledTableCell>Username</StyledTableCell>
                            <StyledTableCell>Phone</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading && (
                            <StyledTableRow>
                                <StyledTableCell colSpan={7} align="center">
                                    Loading teachers...
                                </StyledTableCell>
                            </StyledTableRow>
                        )}

                        {!isLoading && error && (
                            <StyledTableRow>
                                <StyledTableCell colSpan={7} align="center">
                                    {error}
                                </StyledTableCell>
                            </StyledTableRow>
                        )}

                        {!isLoading && !error && paginatedRows.length === 0 && (
                            <StyledTableRow>
                                <StyledTableCell colSpan={7} align="center">
                                    No teachers found.
                                </StyledTableCell>
                            </StyledTableRow>
                        )}

                        {!isLoading &&
                            !error &&
                            paginatedRows.map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell component="th" scope="row" sx={{ width: 50 }}>
                                        {row.id}
                                    </StyledTableCell>
                                    <StyledTableCell>{row.employeeId}</StyledTableCell>
                                    <StyledTableCell>{row.name}</StyledTableCell>
                                    <StyledTableCell>{row.email}</StyledTableCell>
                                    <StyledTableCell>{row.username}</StyledTableCell>
                                    <StyledTableCell>{row.phone}</StyledTableCell>
                                    <StyledTableCell>{row.status}</StyledTableCell>
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
        </Box>
    );
};

export default TeachersPage;
