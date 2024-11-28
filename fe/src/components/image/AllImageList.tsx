import React from "react";
import { Card } from "@nextui-org/react";
import { ImagesNonCheckType } from "@/types/ImagesType";
import { FilterRow } from "@/components/loadimage/filterBox";
import { useRouter } from "next/navigation";

interface ImageListProps {
    images: ImagesNonCheckType[];
    filterRows: FilterRow[];
}

const ImageList = ({ images, filterRows }: ImageListProps) => {
    const router = useRouter();

    const handleImageClick = (imageId: string) => {
        const conditions = filterRows
            .filter(
                (row) =>
                    row.AND.length > 0 ||
                    row.OR.length > 0 ||
                    row.NOT.length > 0
            )
            .map((row) => ({
                and_condition: row.AND,
                or_condition: row.OR,
                not_condition: row.NOT,
            }));

        const searchParams =
            conditions.length > 0
                ? `?conditions=${encodeURIComponent(
                      JSON.stringify(conditions)
                  )}`
                : "";

        router.push(`/image/${imageId}${searchParams}`);
    };

    return (
        <div className="w-full">
            <div className="w-full flex justify-center">
                <div className="grid max-md:gap-x-[2.5rem] grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-3 sm:gap-4 max-w-[calc(10rem*10+1rem*9)]">
                    {images?.map((image, index) => (
                        <div key={index} className="relative">
                            <Card
                                isPressable
                                onPress={() => handleImageClick(image.id)}
                                className="aspect-square w-full max-w-[10rem] p-0"
                            >
                                <div className="relative w-full h-full">
                                    <img
                                        src={image.imageUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageList;
