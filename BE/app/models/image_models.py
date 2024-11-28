from pydantic import BaseModel
from datetime import datetime

class ImageData(BaseModel):
    metadataId: str | None = None
    featureId: str  | None
    createdAt: datetime
    updatedAt: datetime