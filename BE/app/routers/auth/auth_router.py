from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from services.auth.auth_service import UserCreate, EmailValidate, JWTManage, UserLogin, UserLogout
from dto.common_dto import CommonResponse
from dto.users_dto import UserSignUp, UserSignIn, TokenResponse
from models.mariadb_users import Users
from configs.mariadb import get_database_mariadb
from configs.mongodb import get_database_mongodb

security_scheme = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=CommonResponse)
async def signup(
    user_data: UserSignUp,
    maria_db: Session = Depends(get_database_mariadb),
    mongodb: Session = Depends(get_database_mongodb)
    ):
    try:
        user_create = UserCreate(maria_db)
        email_validate = EmailValidate(maria_db, mongodb)
        
        temp_user_data = await user_create.create_temp_user(user_data)
        await email_validate.send_verification_email(user_data.email, temp_user_data)
        
        return CommonResponse(
            status = 201,
            data = {"message": "이메일 인증 코드가 발송되었습니다."}
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        

@router.post("/verification", response_model=CommonResponse[TokenResponse])
async def verification(
    email: str, 
    code: str, 
    maria_db: Session = Depends(get_database_mariadb), 
    mongodb: Session = Depends(get_database_mongodb)
    ):
    try:
        email_validate = EmailValidate(maria_db, mongodb)
        user = await email_validate.verify_and_create_user(email, code)
        jwt_manage = JWTManage(maria_db)
        
        token_data = {
            "access_token": jwt_manage.create_access_token(user),
            "refresh_token": jwt_manage.create_refresh_token(user.user_id)
        }
        
        return CommonResponse(
            status=200,
            data=TokenResponse.model_validate(token_data)
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
@router.post("/login", response_model=CommonResponse[TokenResponse])
async def login(
    login_data: UserSignIn, 
    maria_db: Session = Depends(get_database_mariadb), 
    mongodb: Session = Depends(get_database_mongodb)
    ):
    try:
        jwt_manage = JWTManage(maria_db)
        user_login = UserLogin(maria_db, jwt_manage)
        
        token_data = await user_login.login(login_data)
        return CommonResponse(
            status=200,
            data=token_data
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout", response_model=CommonResponse)
async def logout(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme), 
    maria_db: Session = Depends(get_database_mariadb), 
    mongodb: Session = Depends(get_database_mongodb)
    ):
    try:        
        user_logout = UserLogout(maria_db)
        logout_data = await user_logout.logout(credentials.credentials)
        
        return CommonResponse(
            status=200,
            data=logout_data
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 토큰 재발급
@router.post("/refresh", response_model=CommonResponse[TokenResponse])
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme), 
    maria_db: Session = Depends(get_database_mariadb), 
    mongodb: Session = Depends(get_database_mongodb)
    ):
    try:
        jwt_manage = JWTManage(maria_db)
        payload = jwt_manage.verify_token(credentials.credentials)
        
        if payload.get("token_type") != "refresh":
            raise HTTPException(status_code=401, detail="유효하지 않은 refreshToken입니다.")
            
        # 새로운 토큰 발급을 위한 사용자 정보 조회
        user = maria_db.query(Users).filter(Users.user_id == payload["user_id"]).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        
        token_data = {
            "access_token": jwt_manage.create_access_token(user),
            "refresh_token": jwt_manage.create_refresh_token(user.user_id)
        }
        
        return CommonResponse(
            status=200,
            data=TokenResponse.model_validate(token_data)
        )
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    