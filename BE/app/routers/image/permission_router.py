from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List

from dto.common_dto import CommonResponse
from configs.mariadb import get_database_mariadb
from configs.mongodb import get_database_mongodb
from services.auth.auth_service import JWTManage, Permissions
from services.image.image_extra_service import ImageExtraService
from dto.image_detail_dto import ImageUserPermissionRemoveRequest, ImageDepartmentPermissionRemoveRequest, ImageDepartmentPermissionAddRequest, ImageUserPermissionAddRequest

security_scheme = HTTPBearer()

router = APIRouter(prefix="/image/permission", tags=["Image"])

# 1. 해당 이미지 부서 권한 추가
@router.post('/addDepartment', description="부서 권한 추가")
async def add_department_permission(
    request: ImageDepartmentPermissionAddRequest,
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
        
        image_extra_service = ImageExtraService(maria_db, mongodb)
        response = await image_extra_service.add_department_image_permission(request)

        return CommonResponse(
            status=200,
            data=response
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# 2. 해당 이미지 유저 권한 추가
@router.post('/addUser', description="유저 권한 추가")
async def add_user_permission(
    request: ImageUserPermissionAddRequest,
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
        
        image_extra_service = ImageExtraService(maria_db, mongodb)

        response = await image_extra_service.add_user_image_permission(request)

        return CommonResponse(
            status=200,
            data=response
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# 3. 해당 이미지 유저 권한 삭제
@router.post('/removeUser', description="유저 권한 삭제")
async def remove_user_permission(
    request: ImageUserPermissionRemoveRequest,
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
        
        image_extra_service = ImageExtraService(maria_db, mongodb)

        response = await image_extra_service.remove_user_image_permission(request)

        return CommonResponse(
            status=200,
            data=response
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# 4. 해당 이미지 부서 권한 삭제
@router.post('/removeDepartment', description="유저 권한 삭제")
async def remove_department_permission(
    request: ImageDepartmentPermissionRemoveRequest,
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
        
        image_extra_service = ImageExtraService(maria_db, mongodb)

        response = await image_extra_service.remove_department_image_permission(request)

        return CommonResponse(
            status=200,
            data=response
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))