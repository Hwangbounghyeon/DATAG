from pydantic import BaseModel
from datetime import datetime

class UploadBatch(BaseModel):
    userId: int
    projectId: str
    isDone: bool
    createdAt: datetime
    updatedAt: datetime