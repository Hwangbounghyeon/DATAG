import { ImageDetailResponse } from "@/types/metadata";
import apiClient from "../client";
import { TagBySearchRequest } from "@/types/tag";

export const loadImageDetail = async (
    filterConditions: TagBySearchRequest,
    imageId: string
): Promise<ImageDetailResponse> => {
    const requestForm = {
        image_id: imageId,
        conditions: [...filterConditions.conditions]
    }

    const response = await apiClient<ImageDetailResponse>(
        `/image/detail`,
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
