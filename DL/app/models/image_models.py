from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class ImageData(BaseModel):
    metadataId: Optional[str]
    featureId: Optional[str]
    labelId: Optional[str]
    createdAt: datetime
    updatedAt: datetime