import { FC, useState } from "react";
import Image from "next/image";

const fallbackImageSrc = "/images/zip.png";

interface BaseImageCardProps {
    src: string;
    className?: string;
    children?: React.ReactNode;
}

export const ImageContainer: FC<{ src: string }> = ({ src }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="w-[120px] h-[120px] relative">
            <div className="absolute inset-0 rounded-lg overflow-hidden">
                <Image
                    src={imgError ? fallbackImageSrc : src}
                    alt="No Image"
                    fill
                    sizes="120px"
                    className="object-cover"
                    draggable={false}
                    onError={() => setImgError(true)}
                    priority
                />
            </div>
        </div>
    );
};

const BaseImageCard: FC<BaseImageCardProps> = ({
    src,
    className,
    children,
}) => (
    <div className={`relative ${className || ""}`}>
        <ImageContainer src={src} />
        {children}
    </div>
);

export default BaseImageCard;
