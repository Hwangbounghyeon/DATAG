from pydantic import BaseModel
from typing import Generic, TypeVar

# 제너릭 타입 정의
T = TypeVar('T')

# 기본 응답용 DTO
class CommonResponse(BaseModel, Generic[T]):
    status: int
    data: T | None = None