import { ERROR_MESSAGES } from "@/lib/constants/upload";
import { ValidationResult } from "@/types/upload";

export const createFileInput = ({
    multiple = true,
    accept = "",
    isDirectory = false,
    onChange,
}: {
    multiple?: boolean;
    accept?: string;
    isDirectory?: boolean;
    onChange: (files: File[]) => void;
}) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    input.accept = accept;
    if (isDirectory) {
        input.webkitdirectory = true;
    }

    input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        onChange(files);
    };

    return input;
};

export const validateFiles = (
    files: File[],
    existingFiles: Array<{ name: string }>,
    currentType: "zip" | "images" | "json" | ".7z" | null
): ValidationResult => {
    // 1. 지원하지 않는 파일 타입 체크를 가장 먼저
    const unsupportedFiles = files.filter((file) => {
        const isZip =
            file.type === "application/zip" ||
            file.type === "application/x-zip-compressed" ||
            file.type === "application/x-7z-compressed" ||
            file.name.toLowerCase().endsWith(".7z");
        const isImage = file.type.startsWith("image/");
        const isJson =
            file.type === "application/json" ||
            file.name.toLowerCase().endsWith(".json");
        return !isZip && !isImage && !isJson;
    });

    if (unsupportedFiles.length > 0) {
        return {
            isValid: false,
            error: ERROR_MESSAGES.UNSUPPORTED_TYPE(
                unsupportedFiles.map((f) => f.name)
            ),
        };
    }

    const existingZipFile = existingFiles.some(
        (file) =>
            file.name.toLowerCase().endsWith(".zip") ||
            file.name.toLowerCase().endsWith(".7z")
    );

    // 2. 지원하는 파일들만 분류
    const compressedFiles = files.filter(
        (file) =>
            file.type === "application/zip" ||
            file.type === "application/x-zip-compressed" ||
            file.type === "application/x-7z-compressed" ||
            file.name.toLowerCase().endsWith(".7z")
    );
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const jsonFiles = files.filter(
        (file) =>
            file.type === "application/json" ||
            file.name.toLowerCase().endsWith(".json")
    );

    // 3. 중복 파일 체크
    const existingFileNames = new Set(existingFiles.map((img) => img.name));
    const duplicateFiles = files.filter((file) =>
        existingFileNames.has(file.name)
    );

    if (duplicateFiles.length > 0) {
        return {
            isValid: false,
            error: ERROR_MESSAGES.DUPLICATE_FILES(
                duplicateFiles.map((f) => f.name)
            ),
        };
    }

    // 4. 혼합 파일 체크 (currentType 체크 추가)
    if (
        compressedFiles.length > 0 &&
        (imageFiles.length > 0 || jsonFiles.length > 0)
    ) {
        return { isValid: false, error: ERROR_MESSAGES.MIXED_FILES };
    }

    // 5. ZIP 파일 체크
    if (compressedFiles.length > 0) {
        if (currentType === "images" || currentType === "json") {
            return { isValid: false, error: ERROR_MESSAGES.MIXED_FILES };
        }
        if (existingZipFile || compressedFiles.length > 1) {
            return { isValid: false, error: ERROR_MESSAGES.MULTIPLE_ZIP };
        }
        const fileType = compressedFiles[0].name.toLowerCase().endsWith(".7z")
            ? (".7z" as const)
            : ("zip" as const);

        return {
            isValid: true,
            files: [compressedFiles[0]],
            type: fileType,
        };
    }

    // 6. 이미지 파일 체크
    if (imageFiles.length > 0 || jsonFiles.length > 0) {
        if (currentType === "zip" || currentType === ".7z") {
            return { isValid: false, error: ERROR_MESSAGES.MIXED_FILES };
        }

        const allFiles = [...imageFiles, ...jsonFiles];
        return {
            isValid: true,
            files: allFiles,
            type:
                imageFiles.length > 0 ? ("images" as const) : ("json" as const),
        };
    }

    // 7. 여기까지 왔다면 지원하지 않는 케이스
    return {
        isValid: false,
        error: ERROR_MESSAGES.UNSUPPORTED_TYPE(files.map((f) => f.name)),
    };
};
