from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form, Security, BackgroundTasks, Query, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from sqlalchemy.orm import Session

from configs.mariadb import get_database_mariadb
from configs.mongodb import get_database_mongodb
from dto.common_dto import CommonResponse
from dto.pagination_dto import PaginationDto
from dto.project_dto import ProjectRequest, ProjectResponse, AddImageRequest, AddFilteringImageRequest
from services.project.project_service import ProjectService
from services.auth.auth_service import JWTManage, Permissions
from dto.search_dto import ImageSearchResponse, SearchRequest, SearchProjectImageRequest
from dto.uploads_dto import UploadRequest
from services.project.upload_service import UploadService
import json


security_scheme = HTTPBearer()

router = APIRouter(prefix="/project", tags=["Project"])

# 1. Project 생성
@router.post("/create", description="프로젝트 생성", response_model=CommonResponse[str])
async def project(
    project_request: ProjectRequest,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:    
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        project_service = ProjectService(maria_db, mongodb)

        response = await project_service.create_project(user_id, project_request)

        return CommonResponse(
            status=200,
            data=response
        )
    
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

# 2. Project 리스트 조회
@router.get("/list", response_model=CommonResponse[PaginationDto[List[ProjectResponse] | None]])
async def project_list(
    model_name: str | None = None,
    page: int = 1,
    limit: int = 10,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        project_service = ProjectService(maria_db, mongodb)

        projects_list = await project_service.get_project_list(user_id, model_name, page, limit)

        return CommonResponse(
            status=200,
            data=projects_list
        )

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 3. Project 삭제
@router.delete("/delete/{project_id}")
async def delete_project(
    project_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        ids = await permission.get_project_permissions_editor(user_id, project_id)
        
        if project_id not in ids:
            raise HTTPException(status_code=403, detail="Permission Denied")
        
        project_service = ProjectService(maria_db, mongodb)
        await project_service.delete_project(project_id)
        return CommonResponse(
            status=200,
            data={"message": "프로젝트가 성공적으로 삭제되었습니다."}
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 4. project 이미지 리스트 조회
@router.post("/image/{project_id}/list", response_model=CommonResponse[PaginationDto[ImageSearchResponse]])
async def search_project_images(
    project_id: str,
    conditions: SearchRequest = Body(default=None),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(10, ge=1, le=100, description="페이지당 항목 수"),
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db: Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        ids = await permission.get_project_permissions_viewer(user_id, project_id)
        
        if project_id not in ids:
            raise HTTPException(status_code=403, detail="Permission Denied")
        
        conditions = conditions or SearchRequest()

        project_service = ProjectService(maria_db, mongodb)

        result = await project_service.search_project_images(
            project_id, 
            conditions.conditions,
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

# 5. 이미지 업로드
@router.post("/image/upload", description="이미지 업로드(zip, image)")
async def image_upload(
    background_tasks: BackgroundTasks,
    upload_request: str = Form(...),
    files: List[UploadFile] = File(None),
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]

        parsed_request = json.loads(upload_request)
        upload_request_obj = UploadRequest(**parsed_request)

        permission = Permissions(maria_db, mongodb)
        ids = await permission.get_project_permissions_editor(user_id, upload_request_obj.project_id)
        
        if upload_request_obj.project_id not in ids:
            raise HTTPException(status_code=403, detail="Permission Denied")

        upload = UploadService(maria_db, mongodb)
        file_contents = []

        if files:
            # 모든 파일의 내용을 먼저 읽어 메모리에 저장
            for file in files:
                content = await file.read()
                file_contents.append((file.filename, content))
            background_tasks.add_task(upload.upload_image, upload_request_obj, file_contents, user_id)

        return CommonResponse(
            status=200,
            data="이미지 업로드에 성공하였습니다."
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# 6. Model 선택 리스트
@router.get("/model/list", description="Model List 호출")
async def model_list(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        project_service = ProjectService(maria_db, mongodb)
        model_list = await project_service.get_model_list()
        return CommonResponse(
            status=200,
            data=model_list
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# 7. 선택한 이미지를 project에 저장
@router.post("/image/add", description="선택한 이미지 project에 저장")
async def image_add(
    background_tasks: BackgroundTasks,
    request: AddImageRequest,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        ids = await permission.get_project_permissions_editor(user_id, request.project_id)
        
        if request.project_id not in ids:
            raise HTTPException(status_code=403, detail="Permission Denied")
        
        project_service = ProjectService(maria_db, mongodb)
        background_tasks.add_task(project_service.get_add_image, request)
        return
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# 8. 프로젝트에 이미지 필터링 저장
@router.post("/filterImage/{project_id}/list", description="프로젝트에 이미지 필터링 저장")
async def filter_image_add(
    background_tasks: BackgroundTasks,
    project_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    conditions: AddFilteringImageRequest = Body(default=None),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        ids = await permission.get_project_permissions_editor(user_id, project_id)
        
        if project_id not in ids:
            raise HTTPException(status_code=403, detail="Permission Denied")
        
        project_service = ProjectService(maria_db, mongodb)

        response = background_tasks.add_task(project_service.add_filter_image, project_id, conditions.conditions)

        # response = await project_service.add_filter_image(
        #     project_id,
        #     conditions.conditions
        # )

        return CommonResponse(
            status=200,
            data=response
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 9. 프로젝트 이미지 정보 조회
@router.post('/image/detail', description="프로젝트 이미지 정보 조회")
async def get_image_detail(
    request : SearchProjectImageRequest = Body(default=None),
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        ids = await permission.get_project_permissions_viewer(user_id, request.project_id)
        
        if request.project_id not in ids:
            raise HTTPException(status_code=403, detail="Permission Denied")
        
        project_service = ProjectService(maria_db, mongodb)
        response = await project_service.read_image_detail(request.project_id, request.image_id, request.conditions)

        return CommonResponse(
            status=200,
            data=response
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# 9. 업로드 배치
@router.get('/image/batch', description="프로젝트 업로드 배치 조회")
async def get_image_detail(
    project_id: str,
    page: int = 1,
    limit: int = 10,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        ids = await permission.get_project_permissions_viewer(user_id, project_id)
        
        if project_id not in ids:
            raise HTTPException(status_code=403, detail="Permission Denied")
        
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        upload_service = UploadService(maria_db, mongodb)
        response = await upload_service.get_upload_batch(user_id, project_id, page, limit)

        return CommonResponse(
            status=200,
            data=response
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/image/model/search", response_model=CommonResponse[PaginationDto[List[ImageSearchResponse]]])
async def search_model_images(
    background_tasks: BackgroundTasks,
    conditions: SearchRequest = Body(default=None),
    projectId: str | None = Query(None, description="프로젝트 아이디"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(10, ge=1, le=100, description="페이지당 항목 수"),
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db : Session = Depends(get_database_mariadb),
    mongodb : Session = Depends(get_database_mongodb)
):
    try:
        if not projectId:
            raise HTTPException(status_code=400, detail="Bad Request")
        
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(credentials.credentials)["user_id"]
        
        conditions = conditions or SearchRequest()
        
        project_service = ProjectService(maria_db, mongodb)
        result = await project_service.search_model_images_by_conditions(
            conditions.conditions,
            user_id,
            projectId,
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