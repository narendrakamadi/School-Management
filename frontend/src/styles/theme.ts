import { createTheme } from "@mui/material/styles";

const Theme = createTheme({
    palette: {
        primary: {
            main: "#123c63",
        },
        background: {
            default: "#f4f6f8",
        },
    },

    typography: {
        fontFamily: "Roboto, Arial, sans-serif",
    },

    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        height: 45,
                    },
                    "& .MuiOutlinedInput-input": {
                        padding: "16.5px 14px",
                    },
                    "& .MuiInputLabel-root": {
                        top: "-6px",
                    },
                },
            },
        },
        MuiTable: {
            defaultProps: {
                size: "small",
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    padding: "8px 12px",
                },
                head: {
                    backgroundColor: "#1e3d5b",
                    color: "#ffffff",
                    fontWeight: 600,
                    padding: "10px 12px",
                    borderRadius: 0, // ensure sharp header
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    height: 40,
                    "&:nth-of-type(odd)": {
                        backgroundColor: "#fafafa",
                    },
                    "&:hover": {
                        backgroundColor: "#f1f5f9",
                    },
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                },
            },
        },
    },
});

export default Theme;
