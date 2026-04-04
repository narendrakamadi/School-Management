import { useCallback } from "react";

interface SnackbarMessage {
    message: string;
    type: "success" | "error" | "info" | "warning";
}

export const useSnackbar = () => {
    const showSnackbar = useCallback(
        (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
            const snackbarEvent = new CustomEvent("showSnackbar", {
                detail: { message, type } as SnackbarMessage,
            });
            window.dispatchEvent(snackbarEvent);
        },
        [],
    );

    return { showSnackbar };
};

