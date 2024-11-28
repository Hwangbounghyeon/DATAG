from fastapi import APIRouter, Depends, HTTPException
from typing import List

from dto.ai_model_dto import AIModelRequest
from dto.common_dto import CommonResponse, ErrorResponse
from services.ai_model.detection_service import ObjectDetectionService
from configs.mariadb import get_database_mariadb
from sqlalchemy.orm import Session

router = APIRouter(prefix="/det", tags=["object_detection"])

@router.post(
    "", 
    response_model=CommonResponse[str]
)
async def detect_objects(
    request: AIModelRequest,
    db : Session = Depends(get_database_mariadb)
):
    try:
        detection_service = ObjectDetectionService(db)
        await detection_service.detect_images(request)
        return CommonResponse[str](
            status=200,
            data="success"
        )

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))