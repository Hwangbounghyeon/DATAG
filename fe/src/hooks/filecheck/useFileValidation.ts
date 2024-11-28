import { useCallback, useEffect, useState } from "react";
import { ImageFile } from "@/types/upload";
import { validateFiles } from "./fileUtils";

interface UseFileValidationResult {
    uploadType: "zip" | "images" | "json" | ".7z" | null;
    handleFileValidation: (files: File[]) => void;
}

export const useFileValidation = ({
    images,
    onValidFiles,
}: {
    images: ImageFile[];
    onValidFiles: (files: File[]) => void;
}): UseFileValidationResult => {
    const [uploadType, setUploadType] = useState<
        "zip" | "images" | "json" | ".7z" | null
    >(null);

    useEffect(() => {
        if (images.length === 0) {
            setUploadType(null);
        }
    }, [images]);

    const handleFileValidation = useCallback(
        (files: File[]) => {
            const validation = validateFiles(files, images, uploadType);

            if (!validation.isValid) {
                alert(validation.error);
                return;
            }

            setUploadType(validation.type);
            onValidFiles(validation.files);
        },
        [images, uploadType, onValidFiles]
    );

    return {
        uploadType,
        handleFileValidation,
    };
};
