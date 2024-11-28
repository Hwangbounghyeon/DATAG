import { UploadBatchRequest, UploadBatchResponse } from "@/types/upload";
import { DefaultPaginationType } from "@/types/default";
import { customFetch } from "@/app/actions/customFetch";

export const getUploadBatch = async (
  searchParams: UploadBatchRequest
): Promise<DefaultPaginationType<UploadBatchResponse[]>> => {
  try {
    const response = await customFetch<DefaultPaginationType<UploadBatchResponse[]>>({
        endpoint: `/project/image/batch?project_id=${searchParams.project_id}&page=${searchParams.page}&limit=${searchParams.limit}`,
        method: "GET"
    });

    if (!response.data || !response.data.data) {
      console.error(response.error);
      return {
        status: response.status,
        error: response.error || "Bad Request",
      };
    } else {
      return {
        status: response.status,
        data: response.data.data,
      };
    }
  } catch (error) {
    console.error(error);
    return { status: 500, error: "Internal Server Error" };
  }
};
