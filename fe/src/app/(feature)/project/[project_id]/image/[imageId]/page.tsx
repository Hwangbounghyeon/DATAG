import { Suspense } from "react";
import { ImageDetailContent } from "./ImageDetailContent";
import { FilterCondition } from "@/types/tag";

export default async function ImageDetailPage({
    params,
    searchParams,
}: {
    params: { project_id: string; imageId: string };
    searchParams: { conditions?: string };
}) {
    const conditions: FilterCondition[] | undefined = searchParams.conditions
        ? JSON.parse(decodeURIComponent(searchParams.conditions))
        : undefined;

    return (
        <Suspense fallback={<div>Loading image details...</div>}>
            <ImageDetailContent
                projectId={params.project_id}
                imageId={params.imageId}
                conditions={conditions}
            />
        </Suspense>
    );
}
