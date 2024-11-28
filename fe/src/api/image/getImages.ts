import { ProjectImageListResponse, ImageListResponse, SearchRequest } from "@/types/ImagesType";
import { DefaultPaginationType } from "@/types/default";
import apiClient from "../client";

export const getImages = async (
  searchParams?: SearchRequest
): Promise<DefaultPaginationType<ImageListResponse[]>> => {
  if (searchParams) {
    const response = await apiClient<DefaultPaginationType<ImageListResponse[]>>(
      `/image/search?page=${searchParams?.page}&limit=${searchParams?.limit}`,
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
    const response = await apiClient<DefaultPaginationType<ImageListResponse[]>>(
      `/image/search`,
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