from fastapi import APIRouter, Depends, HTTPException
from typing import List

from dto.ai_model_dto import AIModelRequest
from dto.common_dto import CommonResponse, ErrorResponse
from services.ai_model.classification_service import ClassificationService
from configs.mariadb import get_database_mariadb
from sqlalchemy.orm import Session

router = APIRouter(prefix="/cls", tags=["classification"])

@router.post(
    "", 
    response_model=CommonResponse[str]
)
async def classify_objects(
    request: AIModelRequest,
    db : Session = Depends(get_database_mariadb)
):
    # try:
        classification_service = ClassificationService(db)
        await classification_service.classify_images(request)
        return CommonResponse[str](
            status=200,
            data="success"
        )
    
    # except HTTPException as http_exc:
    #     raise http_exc
    # # except Exception as e:
    #     raise HTTPException(status_code=400, detail=str(e))