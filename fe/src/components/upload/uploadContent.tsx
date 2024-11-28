import { useDropzone, FileRejection, DropEvent } from "react-dropzone";
import ImageUploader from "./ImageUploader";
import { UploadContentProps } from "@/types/upload";
import { ACCEPTED_FILE_TYPES } from "@/lib/constants/upload";
import UploadedContent from "@/components/upload/uploadedContent";
import { useFileValidation } from "@/hooks/filecheck/useFileValidation";
import { useFileSelection } from "@/hooks/filecheck/useFileSelection";

export const UploadContent = ({
    images,
    onFileUpload,
    onDeleteImage,
    onDeleteAllImages,
}: UploadContentProps) => {
    const { handleFileValidation } = useFileValidation({
        images,
        onValidFiles: onFileUpload,
    });

    const { handleSelectFiles, handleSelectFolder } =
        useFileSelection(handleFileValidation);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: handleFileValidation as <T extends File>(
            acceptedFiles: T[],
            fileRejections: FileRejection[],
            event: DropEvent
        ) => void,
        accept: ACCEPTED_FILE_TYPES,
        noClick: true,
        noKeyboard: true,
    });

    return (
        <div className="flex-1 mx-8 h-full mb-8 items-center">
            <div
                {...getRootProps()}
                className="min-h-[80vh] rounded-lg overflow-hidden shadow-lg"
            >
                <input {...getInputProps()} />
                {images.length > 0 ? (
                    <UploadedContent
                        images={images}
                        onDeleteAllImages={onDeleteAllImages}
                        onDeleteImage={onDeleteImage}
                        onSelectFiles={handleSelectFiles}
                        onSelectFolder={handleSelectFolder}
                    />
                ) : (
                    <ImageUploader
                        onSelectFiles={handleSelectFiles}
                        onSelectFolder={handleSelectFolder}
                    />
                )}
            </div>
        </div>
    );
};
