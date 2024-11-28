"use client";
import React, { useState, useEffect } from "react";
import {
    Button,
    Modal,
    ModalContent,
    useDisclosure,
    Spinner,
    Chip,
} from "@nextui-org/react";
import Image from "next/image";

import { createInitialRow, FilterRow } from "@/components/loadimage/filterBox";
import { ImageListResponse, ImagesNonCheckType, ProjectImageListResponse } from "@/types/ImagesType";
import ImageList from "@/components/image/AllImageList";
import PaginationFooter from "@/components/project/dataset/pagination-footer";
import { FilterModal } from "@/components/project/dataset/filter-modal";
import Filter from "@/public/filter.svg";
import { tagApi } from "@/api/detail/tagApi";
import { getImages } from "@/api/image/getImages";
import { DefaultPaginationType } from "@/types/default";

type SizeType =
    | "md"
    | "xs"
    | "sm"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full";

const Page = () => {
    const [images, setImages] = useState<ImagesNonCheckType[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [size, setSize] = useState<SizeType>("3xl");
    const [selectedModal, setSelectedModal] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [limit, setLimit] = useState(30);

    const [tags, setTags] = useState<string[]>([]);
    const [filterRows, setFilterRows] = useState<FilterRow[]>([
        createInitialRow(),
    ]);

    const [isLoading, setIsLoading] = useState(false);

    const getFilteredImages = async () => {
        setIsLoading(true);

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

        const searchParams = {
            page: page,
            limit: limit,
            ...(conditions.length > 0 && { conditions }),
        };

        try {
            const response: DefaultPaginationType<ImageListResponse[]> = await getImages(searchParams);

            if (response.data) {
                const transformedImages: ImagesNonCheckType[] = response.data.data.map(item => {
                    const [id, imageUrl] = Object.entries(item.images)[0];
                    
                    return {
                        id: id,
                        imageUrl: imageUrl,
                    };
                });

                setTotalPage(response.data.total_pages);
                setImages(transformedImages);
            } else {
                setPage(1);
                setTotalPage(1);
                setImages([]);
            }
        } catch (error) {
            console.error("Failed to fetch images:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTags = async () => {
        try {
            setIsLoading(true);
            const response = await tagApi.getTag();
            if (response.data) {
                setTags(response.data.tags);
            }
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getTags();
    }, []);

    useEffect(() => {
        setImages([]);
        getFilteredImages();
    }, [page, filterRows]);

    const handleModalOpen = (componentName: string) => {
        setSelectedModal(componentName);
        onOpen();
    };

    const getModalBody = () => {
        if (selectedModal === "filter") {
            return (
                <FilterModal
                    isOpen={selectedModal === "filter"}
                    onClose={onClose}
                    tags={tags}
                    filterRows={filterRows}
                    setFilterRows={setFilterRows}
                />
            );
        }
        return null;
    };

    return (
        <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                    Dataset
                </h1>
            </div>

            <div className="flex items-center mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
                <Button
                    isIconOnly
                    className="m-2 shrink-0"
                    variant="light"
                    onPress={() => handleModalOpen("filter")}
                >
                    <Image src={Filter} alt="filter" className="w-5 h-5" />
                </Button>
                <div className="flex gap-2 items-center flex-wrap p-3">
                    {filterRows
                        .filter(
                            (row) =>
                                row.AND.length > 0 ||
                                row.OR.length > 0 ||
                                row.NOT.length > 0
                        )
                        .map((row, index) => (
                            <div
                                key={row.id}
                                className="flex gap-2 items-center"
                            >
                                {row.AND.length > 0 && (
                                    <Chip
                                        variant="flat"
                                        color="primary"
                                        className="text-xs"
                                    >
                                        AND: {row.AND.join(", ")}
                                    </Chip>
                                )}
                                {row.OR.length > 0 && (
                                    <Chip
                                        variant="flat"
                                        color="success"
                                        className="text-xs"
                                    >
                                        OR: {row.OR.join(", ")}
                                    </Chip>
                                )}
                                {row.NOT.length > 0 && (
                                    <Chip
                                        variant="flat"
                                        color="danger"
                                        className="text-xs"
                                    >
                                        NOT: {row.NOT.join(", ")}
                                    </Chip>
                                )}
                                {index < filterRows.length - 1 && (
                                    <span className="text-gray-400 dark:text-gray-500">
                                        |
                                    </span>
                                )}
                            </div>
                        ))}
                    {!filterRows.some(
                        (row) =>
                            row.AND.length > 0 ||
                            row.OR.length > 0 ||
                            row.NOT.length > 0
                    ) && (
                        <span className="text-gray-400 dark:text-gray-500">
                            No active filters
                        </span>
                    )}
                </div>
            </div>

            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
                <ImageList
                    images={images}
                    filterRows={filterRows}
                />
                <PaginationFooter
                    currentPage={page}
                    totalPage={totalPage}
                    setCurrentPage={setPage}
                />

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-[20]">
                        <Spinner size="lg" color="white" />
                    </div>
                )}
            </div>

            <Modal
                size={size}
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior="inside"
                classNames={{
                    base: "max-w-full m-0",
                    wrapper: "max-w-full p-0 md:p-4",
                    body: "p-0",
                }}
            >
                <ModalContent>{getModalBody}</ModalContent>
            </Modal>
        </div>
    );
};

export default Page;