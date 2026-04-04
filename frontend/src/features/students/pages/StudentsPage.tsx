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
import { useState } from "react";
import type { ChangeEvent } from "react";
import { usePermission } from "../../../hooks/usePermission";

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
    name: string,
    email: string,
    username: string,
    phone: string,
    city: string,
) {
    return { id, name, email, username, phone, city };
}

const rows = [
    createData(
        "1",
        "Narendra",
        "narendra@gmail.com",
        "narendra",
        "9922422432",
        "Pune",
    ),
    createData("2", "Mohan", "mohan@gmail.com", "mohan", "9922422432", "Pune"),
    createData("3", "Seema", "seema@gmail.com", "seema", "9922422432", "Pune"),
    createData(
        "4",
        "Manasvi",
        "manasvi@gmail.com",
        "manasvi",
        "9922422432",
        "Pune",
    ),
    createData("5", "Ayush", "ayush@gmail.com", "ayush", "9922422432", "Pune"),
    createData("6", "Ajay", "ayush@gmail.com", "ayush", "9922422432", "Pune"),
    createData("7", "Ramesh", "ayush@gmail.com", "ayush", "9922422432", "Pune"),
    createData("8", "Rahul", "ayush@gmail.com", "ayush", "9922422432", "Pune"),
    createData("9", "Radha", "ayush@gmail.com", "ayush", "9922422432", "Pune"),
    createData(
        "10",
        "Mahesh",
        "ayush@gmail.com",
        "ayush",
        "9922422432",
        "Pune",
    ),
    createData(
        "11",
        "Narendra",
        "narendra@gmail.com",
        "narendra",
        "9922422432",
        "Pune",
    ),
    createData("12", "Mohan", "mohan@gmail.com", "mohan", "9922422432", "Pune"),
    createData("13", "Seema", "seema@gmail.com", "seema", "9922422432", "Pune"),
    createData(
        "14",
        "Manasvi",
        "manasvi@gmail.com",
        "manasvi",
        "9922422432",
        "Pune",
    ),
    createData("15", "Ayush", "ayush@gmail.com", "ayush", "9922422432", "Pune"),
    createData("16", "Ajay", "ayush@gmail.com", "ayush", "9922422432", "Pune"),
    createData(
        "17",
        "Ramesh",
        "ayush@gmail.com",
        "ayush",
        "9922422432",
        "Pune",
    ),
    createData("18", "Rahul", "ayush@gmail.com", "ayush", "9922422432", "Pune"),
    createData("19", "Radha", "ayush@gmail.com", "ayush", "9922422432", "Pune"),
    createData(
        "20",
        "Mahesh",
        "ayush@gmail.com",
        "ayush",
        "9922422432",
        "Pune",
    ),
];

const StudentsPage = () => {
    const { can } = usePermission();
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;
    const totalPages = Math.ceil(rows.length / rowsPerPage);

    const handleChangePage = (_event: ChangeEvent<unknown>, value: number) => {
        setPage(value - 1);
    };

    return (
        <Box>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
            >
                <Typography variant="h5">Manage Students</Typography>

                {can("create_students") && (
                    <Button variant="contained">Add Student</Button>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: 50 }}>
                                #
                            </StyledTableCell>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell>Email</StyledTableCell>
                            <StyledTableCell>Username</StyledTableCell>
                            <StyledTableCell>Phone</StyledTableCell>
                            <StyledTableCell>City</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage,
                            )
                            .map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell
                                        component="th"
                                        scope="row"
                                        sx={{ width: 50 }}
                                    >
                                        {row.id}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {row.name}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {row.email}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {row.username}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {row.phone}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {row.city}
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
                        borderTop: (theme) =>
                            `1px solid ${theme.palette.divider}`,
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
                                borderColor:
                                    theme.palette.action.disabledBackground,
                            },
                        })}
                    />
                </Stack>
            </TableContainer>
        </Box>
    );
};

export default StudentsPage;
