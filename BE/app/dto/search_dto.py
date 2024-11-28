from pydantic import BaseModel
from typing import List, Dict

class TagImageResponse(BaseModel):
    tags: List[str] 
    
    
class ImageSearchResponse(BaseModel):
    images: Dict[str, str]


class SearchCondition(BaseModel):
    and_condition: List[str] = []
    or_condition: List[str] = []
    not_condition: List[str] = []
    
    class Config:
        json_schema_extra = {
            "example": [{
                "and_condition": ["cat"],
                "or_condition": ["dog"],
                "not_condition": ["Busan"]
            },
            {
                "and_condition": ["dog"],
                "or_condition": ["Gumi"],
                "not_condition": ["Seoul"]
            }            
            ]
        }
        
class SearchRequest(BaseModel):
    conditions: List[SearchCondition] | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "page": 1,
                "limit": 10,
                "conditions": [
                    {
                        "and_condition": ["cat", "Seoul"],
                        "or_condition": ["2024_11"],
                        "not_condition": ["Zone A"]
                    }
                ]
            }
        }
        
class SearchProjectImageRequest(BaseModel):
    image_id: str
    conditions: List[SearchCondition] | None = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "project_id": "1234567890abcdef12345678",
                "image_id": "abcdef1234567890abcdef12",
                "conditions": [
                    {
                        "and_condition": ["cat", "Seoul"],
                        "or_condition": ["2024_11"],
                        "not_condition": ["Zone A"]
                    }
                ]
            }
        }

class SearchProjectImageRequest(BaseModel):
    project_id: str
    image_id: str
    conditions: List[SearchCondition] | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "project_id": "1234567890abcdef12345678",
                "image_id": "abcdef1234567890abcdef12",
                "conditions": [
                    {
                        "and_condition": ["cat", "Seoul"],
                        "or_condition": ["2024_11"],
                        "not_condition": ["Zone A"]
                    }
                ]
            }
        }
class SearchImageRequests(BaseModel):
    image_id: str
    conditions: List[SearchCondition] | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "image_id": "abcdef1234567890abcdef12",
                "conditions": [
                    {
                        "and_condition": ["cat", "Seoul"],
                        "or_condition": ["2024_11"],
                        "not_condition": ["Zone A"]
                    }
                ]
            }
        }

