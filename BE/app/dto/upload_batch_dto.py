from typing import List
from datetime import datetime
from pydantic import BaseModel

class UploadBatchListData(BaseModel):
    batch_id: str
    user_id: int
    project_id: str
    is_done: bool
    created_at: datetime
    updated_at: datetime