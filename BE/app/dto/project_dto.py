from fastapi import Query
from pydantic import BaseModel
from datetime import datetime
from typing import List

# Project 생성 요청 DTO
class AccessControl(BaseModel):
    view_users: List[str] = None
    edit_users: List[str] = None
    view_departments: List[str] = None
    edit_departments: List[str] = None

class ProjectRequest(BaseModel):
    project_name: str
    project_model_task: str
    project_model_name: str
    description: str
    accesscontrol: AccessControl
    is_private: bool

# project 응답 DTO
class ProjectResponse(BaseModel):
    project_id: str
    project_name: str
    task: str
    model_name: str
    description: str | None = ""
    user_id: int
    department : str | None = ""
    is_private: bool | None = False
    created_at: datetime
    updated_at: datetime
    is_editor: bool
    is_creator: bool

    class Config:
        from_attributes = True
        protected_namespaces = ()

# Project list 조회 요청 DTO
class ProjectListRequest(BaseModel):
    user_id: int
    department: str | None = None
    model_name: str | None = None
    page: int = Query(1, ge=1)
    limit: int = Query(10, ge=1, le=100)

    model_config = {
        "protected_namespaces": ()
    }
    
# Project list 응답 DTO
class ProjectListResponse(BaseModel):
    project_id: int
    project_name: str
    model_name: str
    description: str
    user_name: str
    department_name: str
    is_private: int
    create_at: datetime
    updated_at: datetime
    data_count: int

    class Config:
        from_attributes = True
        protected_namespaces = ()


# User 요청 DTO
class UserRequet(BaseModel):
    user_name: str | None = None 
    page: int = Query(1, ge=1)
    limit: int = Query(10, ge=1, le=100)

# User 응답 DTO
class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    department_name: str | None = None

    class Config:
        from_attributes = True

# Department 응답 DTO
class DepartmentResponse(BaseModel):
    department_id: int
    department_name: str

    class Config:
        from_attributes = True

# AddImage 응답 DTO
class AddImageRequest(BaseModel):
    project_id: str
    image_ids: List

# 프로젝트 이미지 필터링 한것들 싹다 넣기

class SearchCondition(BaseModel):
    and_condition: List[str] = []
    or_condition: List[str] = []
    not_condition: List[str] = []

class AddFilteringImageRequest(BaseModel):
    conditions: List[SearchCondition] | None = None

class AddFilteringImageResponse(BaseModel):
    project_id: str
    image_list: List[str]
