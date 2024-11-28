from typing import List
from pydantic import BaseModel
from models.metadata_models import Metadata

class UserInformation(BaseModel):
    uid: int
    name: str
    department_name: str

class AccessControl(BaseModel):
    users: List[UserInformation]
    departments: List[str]

class Pagination(BaseModel):
    previous_cursor: str | None = None
    next_cursor: str | None = None
    current_page: int
    total_pages: int
    
class ImageDetailResponse(BaseModel):
    metadata: Metadata
    access_control: AccessControl
    pagination: Pagination

class ImageDetailTagAddRequest(BaseModel):
    image_id: str
    tag_list: List[str]

class ImageDetailTagAddResponse(BaseModel):
    image_id: str
    tag_name_list: List[str]

class ImageDetailTagRemoveRequest(BaseModel):
    image_id: str
    remove_tag_list: List[str]

class ImageDetailTagRemoveResponse(BaseModel):
    image_id: str
    tag_name_list: List[str]

class UserDetail(BaseModel):
    user_id: int
    user_name: str
    department_name: str

class ImageUserPermissionAddRequest(BaseModel):
    image_id: str
    user_id_list: List[int]

class ImageDepartmentPermissionAddRequest(BaseModel):
    image_id: str
    department_name_list: List[str]

class ImageUserPermissionAddResponse(BaseModel):
    image_id: str
    user_list: List[UserDetail]

class ImageDepartmentPermissionAddResponse(BaseModel):
    image_id: str
    department_list: List[str]

class ImageUserPermissionRemoveRequest(BaseModel):
    image_id: str
    user_id_list: List[int]

class ImageDepartmentPermissionRemoveRequest(BaseModel):
    image_id: str
    department_name_list: List[str]

class ImageUserPermissionRemoveResponse(BaseModel):
    image_id: str
    user_list: List[UserDetail]

class ImageDepartmentPermissionRemoveResponse(BaseModel):
    image_id: str
    department_list: List[str]