from fastapi import APIRouter, Depends, HTTPException, Security, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from sqlalchemy.orm import Session

from dto.analysis_dto import DimensionReductionRequest, AutoDimensionReductionRequest
from dto.common_dto import CommonResponse
from configs.mariadb import get_database_mariadb
from configs.mongodb import get_database_mongodb
from services.auth.auth_service import JWTManage, Permissions
from services.project.analysis_service import AnalysisService

security_scheme = HTTPBearer()

router = APIRouter(prefix="/project", tags=["Project"])

@router.post("/analysis/manual", response_model=CommonResponse[dict])
async def dimension_reduction(
    request: DimensionReductionRequest,
    background_tasks: BackgroundTasks,
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

        analysis_service = AnalysisService(maria_db, mongodb)
        background_tasks.add_task(
            analysis_service.dimension_reduction,
            request,
            user_id
        )
        
        return CommonResponse[dict](
            status=200,
            data={"message": "분석이 시작되었습니다. 잠시 후 결과를 확인할 수 있습니다."}
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/analysis/auto", response_model=CommonResponse[dict])
async def dimension_reduction(
    request: AutoDimensionReductionRequest,
    background_tasks: BackgroundTasks,
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

        analysis_service = AnalysisService(maria_db, mongodb)
        background_tasks.add_task(
            analysis_service.auto_dimension_reduction,
            request,
            user_id
        )
        
        return CommonResponse[dict](
            status=200,
            data={"message": "분석이 시작되었습니다. 잠시 후 결과를 확인할 수 있습니다."}
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))