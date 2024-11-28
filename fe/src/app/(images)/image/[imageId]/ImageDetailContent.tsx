import { loadImageDetail } from "@/api/image/loadImageDetail";
import ImageDetailClient from "./imageDetailClient";
import {
    isClassificationPrediction,
    isDetectionPrediction,
} from "@/types/metadata";
import { TagBySearchRequest } from "@/types/tag";

interface Props {
    imageId: string;
    conditions?: TagBySearchRequest;
}

export async function ImageDetailContent({
    imageId,
    conditions,
}: Props) {
    const data = await loadImageDetail(
        conditions || {
            conditions: [],
        },
        imageId
    );

    if (!data.data) {
        throw new Error("Data is undefined");
    }

    const aiResult = data.data.metadata?.aiResults?.[0];
    const prediction = aiResult?.predictions?.[0];

    const imageIdx = data.data.pagination.current_page;
    const totalIdx = data.data.pagination.total_pages;
    const nextId = data.data.pagination?.next_cursor || null;
    const prevId = data.data.pagination?.previous_cursor || null;

    const detections =
        aiResult?.task === "det" && isDetectionPrediction(prediction)
            ? prediction.detections
            : [];

    const initialUserAuthorities =
        data.data.access_control?.users?.map((user) => ({
            user_id: user.uid,
            user_name: user.name,
            department_name: user.department_name,
        })) || [];

    const initialDepartmentAuthorities =
        data.data.access_control?.departments || [];

    const initialTags = prediction?.tags || [];

    const classes =
        aiResult?.task === "det" && isDetectionPrediction(prediction)
            ? prediction.detections.map((detection) => detection.prediction)
            : aiResult?.task === "cls" && isClassificationPrediction(prediction)
            ? [prediction.prediction]
            : [];

    const metadata = data.data.metadata?.metadata || {
        branch: "",
        process: "",
        location: "",
        equipmentId: "",
        createdAt: "",
    };

    const imageSrc = data.data.metadata?.fileList?.[0] || "";

    return (
        <ImageDetailClient
            imageId={imageId}
            initialUserAuthorities={initialUserAuthorities}
            initialDepartmentAuthorities={initialDepartmentAuthorities}
            initialTags={initialTags}
            classes={classes}
            imageSrc={imageSrc}
            metadata={metadata}
            detections={detections}
            imageIdx={imageIdx}
            totalItem={totalIdx}
            nextId={nextId}
            prevId={prevId}
            conditions={conditions}
        />
    );
}
