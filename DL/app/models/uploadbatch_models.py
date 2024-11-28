from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class UploadBatch(BaseModel):
    userId: int
    projectId: str
    isDone: bool
    createdAt: datetime
    updatedAt: datetime