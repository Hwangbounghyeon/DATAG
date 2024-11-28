from pydantic import BaseModel
from datetime import datetime

class Project(BaseModel):
    projectName: str
    description: str
    task: str
    modelName: str
    imageCount: int
    isPrivate: bool
    createdAt: datetime
    updatedAt: datetime

    model_config = {
        "protected_namespaces": ()
    }