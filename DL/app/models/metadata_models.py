from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from bson import ObjectId


class AccessControl(BaseModel):
    users: List[int]
    departments: List[str]
    projects: List[str]


class MetadataDetails(BaseModel):
    branch: str
    process: str
    location: str
    equipmentId: str
    uploader: int
    isPrivate: bool
    accessControl: AccessControl
    createdAt: datetime
    mode: str
    
class Prediction(BaseModel):
    fileIndex: int
    prediction: str
    confidence: float
    inferenceStartedAt: datetime
    elapsedTime: float
    tags: List[str]


class AIResult(BaseModel):
    aiModel: str
    task: str
    predictions: List[Prediction]

class Metadata(BaseModel):
    schemaVersion: str
    fileList: List[str]
    metadata: MetadataDetails
    aiResults: List[AIResult]