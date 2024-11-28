from fastapi import APIRouter, BackgroundTasks, HTTPException, Security, Depends, Query, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional

from dto.common_dto import CommonResponse
from configs.mariadb import get_database_mariadb
from configs.mongodb import get_database_mongodb
from services.auth.auth_service import JWTManage, Permissions
from services.image.image_service import ImageService
from services.image.download_service import DownloadService
from dto.search_dto import SearchRequest, ImageSearchResponse, SearchImageRequests
from dto.download_dto import DownloadRequest
from dto.pagination_dto import PaginationDto

security_scheme = HTTPBearer()

router = APIRouter(prefix="/image", tags=["Image"])

# 1. 이미지 정보 조회
@router.post('/detail', description="이미지 정보 조회")
async def get_image_detail(
    request : SearchImageRequests = Body(default=None),
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
            raise HTTPException(status_code=403, detail="Permission Denied")

        image_service = ImageService(maria_db, mongodb)
        response = await image_service.read_image_detail(user_id, request.image_id, request.conditions)

        return CommonResponse(
            status=200,
            data=response
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 2. 다운로드(image + metadata + feature)
@router.post("/download")
async def download(
    request: DownloadRequest, 
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:        
        download_service = DownloadService(maria_db, mongodb)
        return await download_service.download_image(request)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 3. image 전체 조회
@router.post("/search", response_model=CommonResponse[PaginationDto[List[ImageSearchResponse]]])
async def search_images(
    conditions: SearchRequest = Body(default=None),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(10, ge=1, le=100, description="페이지당 항목 수"),
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(credentials.credentials)["user_id"]
        
        conditions = conditions or SearchRequest()
        
        image_service = ImageService(maria_db, mongodb)
        result = await image_service.search_images_by_conditions(
            conditions.conditions, 
            user_id,
            page,
            limit
        )
        
        return CommonResponse(
            status=200,
            data=result
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))