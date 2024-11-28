"use client";

import { tagApi } from "@/api/detail/tagApi";
import { AddTagRequest, DeleteTagRequest } from "@/types/tag";
import { useState } from "react";

export function useTagManager(imageId: string, initialTags: string[]) {
    const [tags, setTags] = useState<string[]>(initialTags);

    const addTag = async (tagName: string) => {
        try {
            const request: AddTagRequest = {
                image_id: imageId,
                tag_list: [tagName],
            };
            const newTag = await tagApi.add(request);
            setTags(newTag);
        } catch (error) {
            console.error("Failed to add tag:", error);
        }
    };

    const removeTag = async (tagName: string) => {
        try {
            const request: DeleteTagRequest = {
                image_id: imageId,
                remove_tag_list: [tagName],
            };
            const newTag = await tagApi.delete(request);
            setTags(newTag);
        } catch (error) {
            console.error("Failed to remove tag:", error);
        }
    };

    return { tags, addTag, removeTag };
}
