import { UploadImageRequest, UploadResponse } from "@/types/imageUpload";
import apiClient from "../client";

export const uploadImage = async (
    request: UploadImageRequest
): Promise<UploadResponse> => {
    const formData = new FormData();

    try {
        formData.append(
            "upload_request",
            JSON.stringify({
                project_id: request.project_id,
                is_private: request.is_private,
            })
        );

        request.images.forEach((item) => {
            formData.append("files", item.data);
        });

        const response = await apiClient<UploadResponse>(
            "/project/image/upload",
            {
                method: "POST",
                body: formData,
                cache: "no-store",
                headers: {},
            }
        );
        return response;
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
};
