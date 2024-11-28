from pydantic import BaseModel, Field
from typing import Generic, TypeVar

# 제너릭 타입 정의
T = TypeVar('T')

# 기본 응답용 DTO
class PaginationDto(BaseModel, Generic[T]):
    data: T | None = None
    page: int
    limit: int
    total_count: int
    total_pages: int