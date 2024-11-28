import { FC } from "react";
import BaseImageCard from "../image/BaseImageCard";

interface LoadImageCardProps {
    src: string;
}

const LoadImageCard: FC<LoadImageCardProps> = ({ src }) => (
    <BaseImageCard src={src} />
);

export default LoadImageCard;
