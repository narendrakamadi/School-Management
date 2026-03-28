// src/theme/theme.ts
import { createTheme } from "@mui/material/styles";

// Define your custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2", // Blue
        },
        secondary: {
            main: "#f50057", // Pink
        },
        background: {
            default: "#f4f6f8",
            paper: "#ffffff",
        },
    },
    typography: {
        fontFamily: "'Roboto', sans-serif",
        h1: {
            fontWeight: 700,
            fontSize: "2rem",
        },
        h2: {
            fontWeight: 600,
            fontSize: "1.75rem",
        },
        body1: {
            fontSize: "1rem",
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: "none",
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: "#1976d2",
                },
            },
        },
    },
});

export default theme;