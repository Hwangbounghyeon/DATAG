import { LoadImageByFilterResponse } from "@/types/imageLoad";
import apiClient from "../client";
import { TagBySearchRequest } from "@/types/tag";

export const searchProjectImages = async (
    project_id: string,
    filterConditions: TagBySearchRequest
): Promise<number> => {
    const response = await apiClient<LoadImageByFilterResponse>(
        `/project/filterImage/${project_id}/list`,
        {
            method: "POST",
            body: JSON.stringify(filterConditions),
            cache: "no-store",
        }
    );

    console.log(filterConditions);
    console.log(response);
    if (!response.data) {
        throw new Error("No data received");
    }

    return response.status;
};
