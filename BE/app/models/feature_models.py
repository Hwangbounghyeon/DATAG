from pydantic import BaseModel
from typing import List
from datetime import datetime

class Feature(BaseModel):
    projectId: str
    feature: List[List[float]]
    createdAt: datetime