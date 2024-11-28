from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np

# 모델 추론 공통 Request Dto
class AIModelRequest(BaseModel):
    image_data: List[dict]
    model_name: str
    department_name: Optional[str] = None
    user_id: int
    project_id: str
    is_private: bool

    model_config = {
        "protected_namespaces": ()
    }

# 모델 추론 공통 Response Dto
class AIModelResponse(BaseModel):
    pass

# 분류 추론 결과 Dto
class ClassificationPredictionResult(BaseModel):
    used_model: str
    predict_class: str
    predict_confidence: float
    features: List[List[float]]
    elapsed_time: float

# 객체탐지 추론 결과 Dto
class ObjectDetectionPredictionResult(BaseModel):
    used_model: str
    threshold: float
    predict_classes: List[str]
    predict_confidences: List[float]
    bboxes: List[List[int]]
    features: List[List[float]]
    elapsed_time: float