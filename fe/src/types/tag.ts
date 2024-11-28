import { DefaultResponseType } from "./default";

export interface FilterCondition {
    and_condition: string[];
    or_condition: string[];
    not_condition: string[];
}

export interface TagBySearchRequest {
    conditions: FilterCondition[];
}

export interface AddTagRequest {
    image_id: string;
    tag_list: string[];
}

export interface DeleteTagRequest {
    image_id: string;
    remove_tag_list: string[];
}

interface TagResponseData {
    image_id: string;
    tag_name_list: string[];
}

export type TagResponse = DefaultResponseType<TagResponseData>;
