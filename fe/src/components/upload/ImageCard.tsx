import { FC } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { ImageCardProps } from "@/types/upload";
import BaseImageCard from "../image/BaseImageCard";

const DeleteButton: FC<{ onDelete: () => void }> = ({ onDelete }) => (
    <div
        className="absolute top-2 right-2 cursor-pointer hover:opacity-80 z-10"
        onClick={onDelete}
    >
        <IoCloseCircle size={24} color="#ff0000" />
    </div>
);

const ImageName: FC<{ name: string }> = ({ name }) => (
    <p className="text-sm mt-1 text-center truncate max-w-[120px]">{name}</p>
);

export const ImageCard: FC<ImageCardProps> = ({ src, name, onDelete }) => (
    <div className="relative w-fit">
        <DeleteButton onDelete={onDelete} />
        <BaseImageCard src={src}>
            <ImageName name={name} />
        </BaseImageCard>
    </div>
);
