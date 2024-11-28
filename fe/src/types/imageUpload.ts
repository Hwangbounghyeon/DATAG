import { DefaultResponseType } from "./default";
import { ImageFile } from "./upload";

export interface UploadImageRequest {
    is_private: boolean;
    project_id: string;
    images: ImageFile[];
}

export type UploadResponse = DefaultResponseType<string[]>;
