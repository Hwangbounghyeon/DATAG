from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List

from dto.common_dto import CommonResponse
from configs.mariadb import get_database_mariadb
from configs.mongodb import get_database_mongodb
from services.auth.auth_service import JWTManage, Permissions
from services.image.image_service import ImageService
from services.image.image_extra_service import ImageExtraService
from dto.image_detail_dto import ImageDetailTagRemoveRequest, ImageDetailTagAddRequest
from dto.search_dto import TagImageResponse

security_scheme = HTTPBearer()

router = APIRouter(prefix="/image/tag", tags=["Image"])

# 1. 해당 이미지에 태그 추가
@router.post('/add', description="태그 추가")
async def add_image_tag(
    request: ImageDetailTagAddRequest,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        ids = await permission.get_image_permissions(user_id)
        
        if request.image_id not in ids:
            raise HTTPException(status_code=401, detail="Permission Denied")
        
        image_extra_service = ImageExtraService(maria_db, mongodb)

        response = await image_extra_service.add_image_tag(request)

        return CommonResponse(
            status=200,
            data=response
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# 2. 해당 이미지에 태그 삭제
@router.post('/remove', description="태그 삭제")
async def remove_image_tag(
    request: ImageDetailTagRemoveRequest,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        ids = await permission.get_image_permissions(user_id)
        
        if request.image_id not in ids:
            raise HTTPException(status_code=401, detail="Permission Denied")
        
        image_extra_service = ImageExtraService(maria_db, mongodb)

        response = await image_extra_service.delete_image_tag(request)

        return CommonResponse(
            status=200,
            data=response
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 3. 태그 리스트 불러오기.
@router.get("/list", response_model=CommonResponse[TagImageResponse])
async def get_tags_and_images(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme), 
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)):
    try:
        image_service = ImageService(maria_db, mongodb)
        result = await image_service.get_tag()
        return CommonResponse(status=200, data=result)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))