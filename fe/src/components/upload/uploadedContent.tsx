import React from "react";
import { ImageGrid } from "./ImageGrid";
import { Button } from "@nextui-org/react";

interface UploadedContentProps {
    images: Array<{ src: string; name: string; data: File }>;
    onDeleteAllImages: () => void;
    onDeleteImage: (index: number) => void;
    onSelectFiles: () => void;
    onSelectFolder: () => void;
}

const UploadedContent: React.FC<UploadedContentProps> = ({
    images,
    onDeleteAllImages,
    onDeleteImage,
    onSelectFiles,
    onSelectFolder,
}) => (
    <div className="flex h-[100dvh] flex-col p-6 justify-center bg-white dark:bg-gray-800">
        <div className="flex justify-end gap-4 mb-4">
            <Button
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={onDeleteAllImages}
            >
                Delete All Files
            </Button>
            <Button
                className="px-6 py-2 border-2 border-dashed"
                onClick={onSelectFiles}
                color="primary"
                variant="ghost"
            >
                Select Files
            </Button>
            <Button
                className="px-6 py-2 border-2 border-dashed"
                onClick={onSelectFolder}
                color="primary"
                variant="ghost"
            >
                Select Folder
            </Button>
        </div>
        <div className="flex flex-col gap-4 h-full">
            <ImageGrid images={images} onDeleteImage={onDeleteImage} />
        </div>
    </div>
);

export default UploadedContent;
