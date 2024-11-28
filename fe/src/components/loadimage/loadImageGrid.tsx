import { FC } from "react";
import LoadImageCard from "./loadImageCard";
import { BaseImageGrid } from "../image/BaseImageGrid";

interface LoadImageType {
    id: string;
    url: string;
}

export const LoadImageGrid: FC<{ images: LoadImageType[] }> = ({ images }) => (
    <BaseImageGrid
        images={images}
        renderItem={(image) => <LoadImageCard key={image.id} src={image.url} />}
    />
);
