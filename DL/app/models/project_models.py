from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class Project(BaseModel):
    projectName: str
    description: str
    modelName: str
    imageCount: int
    isPrivate: bool
    createdAt: datetime
    updatedAt: datetime

    model_config = {
        "protected_namespaces": ()
    }