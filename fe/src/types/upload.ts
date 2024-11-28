export interface ImageFile {
    src: string;
    name: string;
    data: File;
}

export type UploadType = "zip" | "images" | ".7z" | ".json" | null;

export type ValidationResult =
    | { isValid: false; error: string }
    | { isValid: true; files: File[]; type: "zip" | "images" | "json" | ".7z" };

export interface UploadContentProps {
    images: ImageFile[];
    onFileUpload: (files: File[]) => void;
    onDeleteImage: (index: number) => void;
    onDeleteAllImages: () => void;
}

export interface ImageCardProps {
    src: string;
    name: string;
    index: number;
    onDelete: () => void;
}

export interface ImageGridProps {
    images: ImageFile[];
    onDeleteImage: (index: number) => void;
}

export type UploadBatchRequest = {
    project_id: string,
    page: string,
    limit: string
}

export type UploadBatchResponse = {
    batch_id: string;
    user_id: number;
    project_id: string;
    is_done: boolean;
    created_at: string;
    updated_at: string;
}