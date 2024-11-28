import { DefaultResponseType } from "./default";

export interface ImageArray {
    [image_id: string]: string;
}

interface TagResponseData {
    tags: string[];
}

interface ImageResponseData {
    images: ImageArray;
}

interface PaginatedResponse {
    data: ImageResponseData[];
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
}

export type LoadImageByFilterResponse = DefaultResponseType<PaginatedResponse>;

export type TagFilterResponse = DefaultResponseType<TagResponseData>;

export type LoadImageResponse = DefaultResponseType<ImageResponseData>;
