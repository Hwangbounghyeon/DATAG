import { useCallback, useState } from "react";
import { ImageFile } from "../types/upload";

export const useImageState = () => {
    const [images, setImages] = useState<ImageFile[]>([]);

    const addImages = useCallback((files: File[]) => {
        const newImages = files.map((file) => ({
            src: URL.createObjectURL(file),
            name: file.name,
            data: file,
        }));
        setImages((prev) => [...prev, ...newImages]);
    }, []);

    const deleteImage = useCallback((index: number) => {
        setImages((prev) => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].src);
            newImages.splice(index, 1);
            return newImages;
        });
    }, []);

    const deleteAllImages = useCallback(() => {
        images.forEach((image) => {
            URL.revokeObjectURL(image.src);
        });
        setImages([]);
    }, [images]);

    return {
        images,
        addImages,
        deleteImage,
        deleteAllImages,
    };
};
