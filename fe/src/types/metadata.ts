import { User } from "./auth";
import { DefaultResponseType } from "./default";

interface BaseAiPrediction {
    fileIndex: number;
    inferenceStartedAt: string;
    elapsedTime: number;
    tags: string[];
}

// Detection task용 prediction
interface DetectionPrediction extends BaseAiPrediction {
    detections: Detection[];
}

// Classification task용 prediction
interface ClassificationPrediction extends BaseAiPrediction {
    prediction: string;
    confidence: number;
}

interface AiResult {
    aiModel: string;
    task: "det" | "cls";
    predictions: DetectionPrediction[] | ClassificationPrediction[];
}

interface AccessControlResponse {
    users: User[];
    departments: string[];
}

interface AccessControl {
    users: number[];
    departments: string[];
    projects: string[];
}

interface Metadata {
    branch: string;
    process: string;
    location: string;
    equipmentId: string;
    uploader: number;
    isPrivate: boolean;
    accessControl: AccessControl;
    createdAt: string;
    mode: string;
}

export interface Detection {
    prediction: string;
    confidence: number;
    threshold: number;
    bbox: number[];
}

interface ImageDetail {
    _id: string;
    schemaVersion: string;
    fileList: string[];
    metadata: Metadata;
    aiResults: AiResult[];
}

interface Pagination {
    previous_cursor?: string;
    next_cursor?: string;
    current_page: number;
    total_pages: number;
}

interface ImageDetailResponseData {
    metadata: ImageDetail;
    access_control: AccessControlResponse;
    pagination: Pagination;
}

export type ImageDetailResponse = DefaultResponseType<ImageDetailResponseData>;

export function isDetectionPrediction(
    prediction: DetectionPrediction | ClassificationPrediction
): prediction is DetectionPrediction {
    return "detections" in prediction;
}

export function isClassificationPrediction(
    prediction: DetectionPrediction | ClassificationPrediction
): prediction is ClassificationPrediction {
    return "prediction" in prediction;
}
