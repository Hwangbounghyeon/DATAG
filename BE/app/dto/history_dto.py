from fastapi import Query
from pydantic import BaseModel
from datetime import datetime
from typing import List

# Project 생성 요청 DTO
class HistoryListRequest(BaseModel):
    project_id: str
    page: int
    limit: int

class HistoryListData(BaseModel):
    history_id: str
    history_name: str
    is_done: int
    created_at: datetime
    updated_at: datetime

class HistoryListResponse(BaseModel):
    data: List[HistoryListData]
    page: int
    limit: int
    total_count: int
    total_pages: int

class HistoryDetailRequest(BaseModel):
    pass

class HistoryDetailResponse(BaseModel):
    pass