import { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import type { AlertColor } from "@mui/material";

interface SnackbarMessage {
    message: string;
    type: AlertColor;
}

export const GlobalSnackbar = () => {
    const [open, setOpen] = useState(false);
    const [snackbarData, setSnackbarData] = useState<SnackbarMessage>({
        message: "",
        type: "info",
    });

    useEffect(() => {
        const handleShowSnackbar = (event: Event) => {
            const customEvent = event as CustomEvent<SnackbarMessage>;
            setSnackbarData(customEvent.detail);
            setOpen(true);
        };

        window.addEventListener("showSnackbar", handleShowSnackbar);

        return () => {
            window.removeEventListener("showSnackbar", handleShowSnackbar);
        };
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
            <Alert onClose={handleClose} severity={snackbarData.type} sx={{ width: "100%" }}>
                {snackbarData.message}
            </Alert>
        </Snackbar>
    );
};

export default GlobalSnackbar;

