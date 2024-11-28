import { FilterRow } from "@/components/loadimage/filterBox";

export type ImagesType = {
  id: string;
  imageUrl: string;
  checked: boolean;
};

export type ImagesNonCheckType = {
  id: string;
  imageUrl: string;
};

export type ProjectImageListResponse = {
  images: Record<string, string>;
};

export type ImageListResponse = {
  images: Record<string, string>;
};

export type SearchCondition = {
  and_condition: string[];
  or_condition: string[];
  not_condition: string[];
};

export type SearchRequest = {
  page?: number;
  limit?: number;
  conditions?: SearchCondition[];
};

export type DownloadRequest = {
  image_list: string[];
}

export type UploadBatch = {
  userId: number;
  projectId: string;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
}