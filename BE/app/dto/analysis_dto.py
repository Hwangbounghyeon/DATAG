from pydantic import BaseModel
from typing import List
from dto.search_dto import SearchCondition

# 모델 추론 공통 Request Dto
class DimensionReductionRequest(BaseModel):
    algorithm: str
    project_id: str
    history_name: str
    is_private: bool
    selected_tags: List[SearchCondition]
    image_ids: List[str]

class AutoDimensionReductionRequest(BaseModel):
    algorithm: str
    project_id: str
    history_name: str
    is_private: bool
    selected_tags: List[SearchCondition]

# 모델 추론 공통 Response Dto
class DimensionReductionResponse(BaseModel):
    history_id: str
    project_id: str
    user_id: int
    history_name: str
