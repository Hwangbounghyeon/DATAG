import { Suspense } from "react";
import { ImageDetailContent } from "./ImageDetailContent";
import { TagBySearchRequest } from "@/types/tag";

export default async function ImageDetailPage({
    params,
    searchParams,
}: {
    params: { imageId: string };
    searchParams: { conditions?: string };
}) {
    const conditions: TagBySearchRequest | undefined = searchParams.conditions
        ? JSON.parse(decodeURIComponent(searchParams.conditions))
        : undefined;

    return (
        <Suspense fallback={<div>Loading image details...</div>}>
            <ImageDetailContent
                imageId={params.imageId}
                conditions={conditions}
            />
        </Suspense>
    );
}
