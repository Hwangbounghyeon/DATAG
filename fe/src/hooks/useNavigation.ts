"use client";

import { searchProjectImages } from "@/api/load/uploadData";
import { uploadImage } from "@/api/upload/uploadImage";
import { TagBySearchRequest } from "@/types/tag";
import { ImageFile } from "@/types/upload";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Bounce, toast } from "react-toastify";

export const useNavigation = (projectId: string) => {
    const router = useRouter();

    const goBack = useCallback(() => {
        router.back();
    }, [router]);

    const isEmptyConditions = (filter: TagBySearchRequest) => {
        return filter.conditions.every(
            (condition) =>
                condition.and_condition.length === 0 &&
                condition.or_condition.length === 0 &&
                condition.not_condition.length === 0
        );
    };

    const goToLoadImages = useCallback(
        async (images: ImageFile[], currentFilter: TagBySearchRequest) => {
            try {
                if (!images || images.length === 0) {
                    await searchProjectImages(projectId, currentFilter);
                } else if (isEmptyConditions(currentFilter)) {
                    await uploadImage({
                        is_private: true,
                        project_id: projectId,
                        images,
                    });
                } else {
                    await Promise.all([
                        uploadImage({
                            is_private: true,
                            project_id: projectId,
                            images,
                        }),
                        searchProjectImages(projectId, currentFilter),
                    ]);
                }

                toast.success("Image Upload Success!", {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    draggable: true,
                    progress: undefined,
                    transition: Bounce,
                });

                router.push(`/project/${projectId}`);
            } catch (error) {
                toast.error("Image Upload Failed!", {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    draggable: true,
                    progress: undefined,
                    transition: Bounce,
                });
            }
        },
        [projectId, router]
    );

    return {
        goBack,
        goToLoadImages,
    };
};
