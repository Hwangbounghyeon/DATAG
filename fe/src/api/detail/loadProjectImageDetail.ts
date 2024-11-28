import { ImageDetailResponse } from "@/types/metadata";
import apiClient from "../client";
import { TagBySearchRequest } from "@/types/tag";

export const loadProjectImageDetail = async (
    filterConditions: TagBySearchRequest,
    imageId: string,
    project_id: string
): Promise<ImageDetailResponse> => {
    const requestForm = {
        project_id: project_id,
        image_id: imageId,
        conditions: filterConditions.conditions,
    };

    const response = await apiClient<ImageDetailResponse>(
        `/project/image/detail`,
        {
            method: "POST",
            body: JSON.stringify(requestForm),
            cache: "no-store",
        }
    );

    if (!response.data) {
        throw new Error("No data received");
    }

    return response;
};
