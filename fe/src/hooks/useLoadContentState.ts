import { useState, useCallback, useEffect } from "react";
import { tagApi } from "@/api/detail/tagApi";
import { ImageArray } from "@/types/imageLoad";
import { TagBySearchRequest } from "@/types/tag";

export const useLoadContentState = (projectId: string) => {
    const [page, setPage] = useState(1);
    const [images, setImages] = useState<ImageArray>({});
    const [tags, setTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentFilter, setCurrentFilter] = useState<TagBySearchRequest>({
        conditions: [
            {
                and_condition: [],
                or_condition: [],
                not_condition: [],
            },
        ],
    });

    const fetchTags = useCallback(async () => {
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
    }, []);

    const searchByFilter = useCallback(
        async (filterConditions: TagBySearchRequest, page: number) => {
            try {
                setIsLoading(true);
                const response = await tagApi.searchByTag(
                    filterConditions,
                    page,
                    40,
                    projectId
                );

                if (response?.data) {
                    const allImages = response.data.data.reduce(
                        (acc, item) => ({
                            ...acc,
                            ...item.images,
                        }),
                        {}
                    );
                    setImages(allImages);
                    setTotalPages(response.data.total_pages);
                    setCurrentFilter(filterConditions);
                }
            } catch (error) {
                console.error("Failed to filter images:", error);
                setImages({});
                setTotalPages(0);
            } finally {
                setIsLoading(false);
            }
        },
        [setImages, setTotalPages, setCurrentFilter, setIsLoading]
    );

    const initialize = useCallback(async () => {
        await fetchTags();
        await searchByFilter(currentFilter, page);
    }, []);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return {
        page,
        setPage,
        images,
        tags,
        isLoading,
        totalPages,
        currentFilter,
        searchByFilter,
        initialize,
    };
};
