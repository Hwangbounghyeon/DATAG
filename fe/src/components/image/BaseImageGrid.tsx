interface BaseImage {
    id?: string;
    name?: string;
    url?: string;
    src?: string;
}

interface BaseImageGridProps<T extends BaseImage> {
    images: T[];
    renderItem: (image: T, index: number) => React.ReactNode;
    className?: string;
}

export const BaseImageGrid = <T extends BaseImage>({
    images,
    renderItem,
    className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4 px-2",
}: BaseImageGridProps<T>) => {
    return (
        <div className="px-8 py-12">
            <div className={className}>
                {images.map((image, index) => renderItem(image, index))}
            </div>
        </div>
    );
};
