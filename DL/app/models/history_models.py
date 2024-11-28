from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class Parameters(BaseModel):
    selectedAlgorithm: str
    selectedTags: List[List[str]]

class ReductionResults(BaseModel):
    imageIds: List[int]
    reductionFeatures: List[List[float]]

class HistoryData(BaseModel):
    userId: int
    projectId: str
    isPrivate: bool
    historyName: str
    isDone: bool
    parameters: Optional[Parameters] = None
    results: Optional[ReductionResults] = None
    createdAt: datetime
    updatedAt: datetime