from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from bson import ObjectId

class ProjectHistory(BaseModel):
    project: Dict[str, List[str]]

class ProjectImage(BaseModel):
    project: Dict[str, List[List[str]]]

class TagMappingData(BaseModel):
    tag: Dict[str, List[str]]

class ImagePermission(BaseModel):
    user: List[str]
    department: List[str]
    project: List[str]

class ImagePermissionMappingData(BaseModel):
    image: Dict[str, ImagePermission]

class UserUploadBatch(BaseModel):
    user: Dict[str, List[str]]

class userUploadBatchMappingData(BaseModel):
    project: Dict[str, UserUploadBatch]