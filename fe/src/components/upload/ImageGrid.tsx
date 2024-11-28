import { FC } from "react";
import { BaseImageGrid } from "../image/BaseImageGrid";
import { ImageCard } from "./ImageCard";

interface UploadImageType {
    name: string;
    src: string;
}

export const ImageGrid: FC<{
    images: UploadImageType[];
    onDeleteImage: (index: number) => void;
}> = ({ images, onDeleteImage }) => (
    <BaseImageGrid
        images={images}
        renderItem={(image, index) => (
            <ImageCard
                key={image.name}
                src={image.src}
                name={image.name}
                index={index + 1}
                onDelete={() => onDeleteImage(index)}
            />
        )}
    />
);
