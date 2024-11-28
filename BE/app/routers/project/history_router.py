from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from sqlalchemy.orm import Session

from dto.pagination_dto import PaginationDto
from dto.history_dto import HistoryListData
from dto.common_dto import CommonResponse
from configs.mariadb import get_database_mariadb
from configs.mongodb import get_database_mongodb
from models.history_models import HistoryData
from services.auth.auth_service import JWTManage, Permissions
from services.project.history_service import HistoryService

security_scheme = HTTPBearer()

router = APIRouter(prefix="/project/history", tags=["Project"])

@router.get("/{project_id}/list", response_model=CommonResponse[PaginationDto[List[HistoryListData]]])
async def get_history_list(
    project_id: str,
    page: int = 1,
    limit: int = 10,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db: Session = Depends(get_database_mariadb),
    mongodb: Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        ids = await permission.get_project_permissions_viewer(user_id, project_id)
        
        if project_id not in ids:
            raise HTTPException(status_code=403, detail="Permission Denied")

        history_service = HistoryService(maria_db, mongodb)
        results = await history_service.get_histories(project_id, user_id, page, limit)

        return CommonResponse[PaginationDto[List[HistoryListData]]](
            status=200,
            data=results
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/detail/{history_id}", response_model=CommonResponse[HistoryData])
async def get_history_detail(
    history_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db: Session = Depends(get_database_mariadb),
    mongodb: Session = Depends(get_database_mongodb)
):
    # try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        pjt_id = await permission._get_history_id_to_project_id(history_id)
        ids = await permission.get_project_permissions_viewer(user_id, pjt_id)
        
        if pjt_id not in ids:
            raise HTTPException(status_code=403, detail="Permission Denied")
        
        history_service = HistoryService(maria_db, mongodb)
        results = await history_service.get_history_detail(history_id)

        return CommonResponse[HistoryData](
            status=200,
            data=results
        )
    # except HTTPException as http_exc:
    #     raise http_exc
    # except Exception as e:
    #     raise HTTPException(status_code=400, detail=str(e))
    
@router.delete("/delete/{history_id}", description="History 삭제")
async def delete_history(
    history_id: str,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    maria_db: Session = Depends(get_database_mariadb),
    mongodb: Session = Depends(get_database_mongodb)
):
    try:
        access_token = credentials.credentials
        jwt = JWTManage(maria_db)
        user_id = jwt.verify_token(access_token)["user_id"]
        
        permission = Permissions(maria_db, mongodb)
        pjt_id = await permission._get_history_id_to_project_id(history_id)
        ids = await permission.get_project_permissions_editor(user_id, pjt_id)
        
        if pjt_id not in ids:
            raise HTTPException(status_code=403, detail="Permission Denied")
        
        history_service = HistoryService(maria_db, mongodb)
        await history_service.delete_history(history_id)

        return CommonResponse[str](
            status=200,
            data="History를 성공적으로 삭제하였습니다."
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))