from pydantic import BaseModel
from typing import List, Any
from datetime import datetime
from dto.search_dto import SearchCondition

class Parameters(BaseModel):
    selectedAlgorithm: str
    selectedTags: List[SearchCondition]

class ReductionResults(BaseModel):
    imageId: str
    detailId: str
    imageUrl: str
    features: List[float] | None = None
    predictions: Any
    label: Any

class HistoryData(BaseModel):
    userId: int
    projectId: str
    isPrivate: bool
    historyName: str
    isDone: int # 0 = 진행중 / 1 = 성공 / 2 = 실패
    parameters: Parameters | None = None
    results: List[ReductionResults] | None = None
    createdAt: datetime
    updatedAt: datetime