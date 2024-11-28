export type HistoryListData = {
  history_id: string;
  history_name: string;
  is_done: number;
  created_at: string;
  updated_at: string;
};

export type HistoryResponseType = {
  status: number;
  data: {
    data: HistoryListData[];
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
};

export type Parameters = {
  selectedAlgorithm: string;
  selectedTags: string[][];
}

export type ClassificationPredictions = {
  prediction: string;
  confidnence: number;
} 

export type ObjectDetectionPredictions = {
  prediction: string;
  confidnence: number;
  threshold: number;
  bbox: number[];
}

export type ObjectDetectionLabels = {
  label: string;
  bbox: number[];
}

export type ReductionResults = {
  imageId: string;
  detailId: string;
  imageUrl: string;
  features: number[] | null;
  predictions: ClassificationPredictions | ObjectDetectionPredictions | null;
  label?: ObjectDetectionLabels | string;
  iou?: number;
}

export type HistoryData = {
  userId: number;
  projectId: string;
  isPrivate: boolean;
  historyName: string;
  isDone: number;
  parameters?: Parameters;
  results?: ReductionResults[];
  createdAt: Date;
  updatedAt: Date;
}

export type HistoryDetailResponseType = {
  status: number;
  data: HistoryData;
};