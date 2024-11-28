from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from services.auth.auth_service import JWTManage
from services.user.user_service import UserService
from dto.common_dto import CommonResponse
from dto.users_dto import UserSignUp, UserSignIn, TokenResponse, UserProfileUpdateRequest, UserProfileResponse
from models.mariadb_users import Users
from configs.mariadb import get_database_mariadb

security_scheme = HTTPBearer()

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/profile", response_model=CommonResponse[UserProfileResponse])
async def get_my_profile(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    db: Session = Depends(get_database_mariadb)
):
    try:
        jwt = JWTManage(db)
        current_user = jwt.verify_token(credentials.credentials)
        
        profile_service = UserService(db)
        profile = profile_service.get_profile(current_user["user_id"])

        return CommonResponse(
            status=200,
            data=profile
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.put("/profile", response_model=CommonResponse[UserProfileResponse])
async def update_my_profile(
    profile_data: UserProfileUpdateRequest,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    db: Session = Depends(get_database_mariadb)
):
    try:
        jwt = JWTManage(db)
        current_user = jwt.verify_token(credentials.credentials)

        profile_service = UserService(db)
        updated_profile = profile_service.update_profile(
            current_user["user_id"], 
            profile_data
        )

        return CommonResponse(
            status=200,
            data=updated_profile
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# 5. 사용자 이름 검색
@router.get("/search")
async def search_user_name(
    user_name: str | None = None,
    page: int = 1,
    limit: int = 10,
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    db: Session = Depends(get_database_mariadb)
):
    try:
        user_service = UserService(db)
        users = await user_service.search_user_name(user_name, page, limit)
        return CommonResponse(
            status=200,
            data=users
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))