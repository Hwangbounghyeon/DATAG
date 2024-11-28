import { useCallback } from "react";
import { createFileInput } from "./fileUtils";

export const useFileSelection = (onFilesSelected: (files: File[]) => void) => {
    const handleSelectFiles = useCallback(() => {
        const input = createFileInput({
            accept: "image/*,.zip,.7z,.json",
            onChange: onFilesSelected,
        });
        input.click();
    }, [onFilesSelected]);

    const handleSelectFolder = useCallback(() => {
        const input = createFileInput({
            isDirectory: true,
            onChange: onFilesSelected,
        });
        input.click();
    }, [onFilesSelected]);

    return {
        handleSelectFiles,
        handleSelectFolder,
    };
};
