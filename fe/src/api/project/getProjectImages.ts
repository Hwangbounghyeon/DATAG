import { ProjectImageListResponse, SearchRequest } from "@/types/ImagesType";
import { DefaultPaginationType } from "@/types/default";
import apiClient from "../client";

export const getProjectImages = async (
  projectId: string,
  searchParams?: SearchRequest
): Promise<DefaultPaginationType<ProjectImageListResponse>> => {
  if (searchParams) {
    const response = await apiClient<DefaultPaginationType<ProjectImageListResponse>>(
      `/project/image/${projectId}/list?page=${searchParams?.page}&limit=${searchParams?.limit}`,
      {
        method: "POST",
        body: JSON.stringify({
          ...(searchParams.conditions && { conditions: searchParams.conditions })
        }),
        cache: "no-store",
      }
    );
  
    if (!response.data) {
      throw new Error("No data received");
    }

    return response;
  } else {
    const response = await apiClient<DefaultPaginationType<ProjectImageListResponse>>(
      `/project/image/${projectId}/list`,
      {
        method: "POST",
        cache: "no-store",
      }
    );
  
    if (!response.data) {
      throw new Error("No data received");
    }

    return response;
  }
};
