import json
from bson import ObjectId
import jwt
import redis
import os
import secrets
import smtplib

from datetime import datetime, timedelta
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from utils.timezone import get_current_time
from dto.users_dto import UserSignUp, UserSignIn, TokenResponse
from fastapi import HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from models.mariadb_users import Users, Departments

load_dotenv()

# 필수기능

## 1. 회원가입
class UserCreate:
    def __init__(self, db: Session):
        # DB session을 받아 초기화 하고, 비밀번호를 bcrypt로 해싱.
        self.db = db
        self.pwd_context = CryptContext(schemes=["bcrypt"])

    # 임시로 사용자 생성(UserSchema로 들어오는 데이터 검증)
    async def create_temp_user(self, user_data: UserSignUp):
        if self._check_existing_email(user_data.email):
            raise HTTPException(status_code=400, detail="해당 이메일이 이미 존재합니다.")
            
        # 비밀번호 해싱
        hashed_password = self.pwd_context.hash(user_data.password)
        
        # user_data를 DTO -> Dict로 변환하고 그 중 비밀번호를 hash된 비밀번호로 교체한다.
        temp_user_data = user_data.model_dump()
        temp_user_data["password"] = hashed_password
        
        return temp_user_data
    
    # 이메일 중복 체크
    def _check_existing_email(self, email: str) -> bool:
        result = self.db.query(Users).filter(Users.email == email).first()
        return bool(result)
    
## 2. 회원가입 이메일 인증
class EmailValidate:
    def __init__(self, db: Session, mongodb: Session):
        # DB session을 받아서 초기화
        self.db = db
        self.collection_image_permissions = mongodb.get_collection("imagePermissions")
        self.collection_project_permissions = mongodb.get_collection("projectPermissions")
        
        try:
            redis_host = os.getenv('REDIS_HOST')
            redis_port = int(os.getenv('REDIS_PORT', 6379))
            redis_password = os.getenv('REDIS_PASSWORD')
            
            # Redis 클라이언트 설정(같은 네트워크로 묶을 것이므로 localhost에 연결, decode_response=True로 하면 반환값을 자동으로 문자열로 디코딩)
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                password=redis_password,
                db=0,
                decode_responses=True
            )
            # Redis 연결 테스트
            self.redis_client.ping()
            
        except Exception as e:
            raise Exception(f"Redis 연결 실패: {str(e)}")
        
        self.verification_expire_seconds = 180
        self.max_attempts = 5
        self.attempt_expire_seconds = 3600
        
    async def send_verification_email(self, email: str, temp_user_data: dict):
        # Redis에 인증 정보 저장
                
        try:
            # 이전 인증 시도 횟수 확인 후 진행
            attempt_key = f"attempt:{email}"
            attempt_count = self.redis_client.get(attempt_key)
            
            if attempt_count and int(attempt_count) >= self.max_attempts:
                raise HTTPException(
                    status_code=400,
                    detail="이메일 인증 시도 너무 많습니다. 1시간 후에 다시 시도해주세요."
                )
            
            # 인증 코드 생성
            verification_code = secrets.token_urlsafe(6)
            
            # Redis에 인증 정보 저장
            await self._store_verification_data(email, verification_code, temp_user_data)
            
            await self._send_email(email, verification_code)
            return verification_code
        except Exception as e:
            # 이메일 발송 실패시 Redis 데이터 삭제
            await self._remove_verification_data(email)
            raise HTTPException(
                status_code=500,
                detail=f"이메일 인증코드 전송에 실패했습니다: {str(e)}"
            )
            
    
            
    async def _initialize_permissions_collections(self, db: Session):
        try:
            # 부서 정보
            departments = db.query(Departments).all()
            department_names = [dept.department_name for dept in departments]
            
            # 1. imagePermissions 관리
            image_permissions = await self.collection_image_permissions.find_one()
            if not image_permissions:
                # Document가 없는 경우 새로 생성
                new_image_permissions = {
                    "user": {},
                    "department": {dept_name: [] for dept_name in department_names},
                    "project": {}
                }
                await self.collection_image_permissions.insert_one(new_image_permissions)
            else:
                # Document는 있지만 department field가 없는 경우
                for dept_name in department_names:
                    if "department" not in image_permissions:
                        await self.collection_image_permissions.update_one(
                            {"_id": image_permissions["_id"]},
                            {"$set": {"department": {dept_name: []}}}
                        )
                    # department field가 있지만 Human Resource가 없는 경우
                    elif dept_name not in image_permissions["department"]:
                        await self.collection_image_permissions.update_one(
                            {"_id": image_permissions["_id"]},
                            {"$set": {f"department.{dept_name}": []}}
                        )


            # 2. projectPermissions 관리
            project_permissions = await self.collection_project_permissions.find_one()
            if not project_permissions:
                # Document가 없는 경우 새로 생성
                new_project_permissions = {
                    "user": {},
                    "department": {
                        dept_name: {
                            "view": [],
                            "edit": []
                        } for dept_name in department_names
                    }
                }
                await self.collection_project_permissions.insert_one(new_project_permissions)
            else:
                # Document는 있지만 department field가 없는 경우
                for dept_name in department_names:
                    if "department" not in project_permissions:
                        await self.collection_project_permissions.update_one(
                            {"_id": project_permissions["_id"]},
                            {"$set": {"department": {dept_name: {"view": [], "edit": []}}}}
                        )
                # department field는 있지만 Human Resource가 없는 경우
                    elif dept_name not in project_permissions["department"]:
                        await self.collection_project_permissions.update_one(
                            {"_id": project_permissions["_id"]},
                            {"$set": {f"department.{dept_name}": {"view": [], "edit": []}}}
                        )
        except Exception as e:
            raise Exception(f"Permissions 컬렉션을 수정할 수 없습니다: {str(e)}")
    

    async def verify_and_create_user(self, email: str, code: str):
        
        # Redis에서 저장된 인증 정보 확인
        stored_data = await self._get_verification_data(email)
        if not stored_data:
            raise HTTPException(
                status_code=400,
                detail="인증코드가 존재하지 않습니다."
            )

        stored_data = json.loads(stored_data)
        if stored_data['code'] != code:
            raise HTTPException(
                status_code=400,
                detail="유효하지 않은 인증코드입니다"
            )

        try:
            new_user = Users(**stored_data['user_data'])
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            
            # 인증 완료 후 Redis 데이터 삭제
            await self._initialize_permissions_collections(self.db)
            await self._remove_verification_data(email)
            
            return new_user
        except Exception as e:
            #  DB에 회원 정보 저장 실패
            self.db.rollback()
            print(f"DB 저장에 실패하였습니다: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="회원가입에 실패하였습니다"
            )

    async def _store_verification_data(self, email: str, code: str, user_data: dict):
        try:
            # Redis Transaction
            pipe = self.redis_client.pipeline()
            
            verification_key = f"이메일 인증:{email}"
            attempt_key  = f"attempt:{email}"
            
            # 이전 인증 데이터 삭제
            pipe.delete(verification_key)
            
            verification_data = {
                'code': code,
                'user_data': user_data,
                'created_at': datetime.now().isoformat(),
                'attempts': 0
            }
            pipe.setex(
                verification_key,
                self.verification_expire_seconds,
                json.dumps(verification_data)
            )
            
            pipe.incr(attempt_key)
            pipe.expire(attempt_key, self.attempt_expire_seconds)
            
            # Pipe는 transaction으로 묶여서 실행
            pipe.execute()
        except Exception as e:
            raise Exception(f"Redis 인증 데이터 저장에 실패했습니다: {str(e)}")

    async def _get_verification_data(self, email: str) -> str:
        return self.redis_client.get(f"이메일 인증:{email}")

    async def _remove_verification_data(self, email: str):
        self.redis_client.delete(f"이메일 인증:{email}")

    async def _send_email(self, email: str, code: str):
        # Postfix 서버를 이용해서 메일 전송
        try:
            msg = MIMEMultipart()
            admin_email = os.getenv('ADMINISTRATOR_EMAIL')
            smtp_host = os.getenv('SMTP_HOST')
            smtp_port = int(os.getenv('SMTP_PORT', 587))
            smtp_password = os.getenv('SMTP_PASSWORD')

            print(f"SMTP 설정 확인 - Host: {smtp_host}, Port: {smtp_port}, From: {admin_email}")
            
            msg['From'] = admin_email
            msg['To'] = email
            msg['Subject'] = "이메일 인증"

            body = f"인증 코드: {code}\n\n코드를 확인 후 입력해주세요."
            msg.attach(MIMEText(body, 'plain'))
            
            # print("SMTP 서버 연결 시도...")
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                # print("TLS 시작...")
                server.starttls()  # TLS 보안 연결
                # print("로그인 시도...")
                server.login(admin_email, smtp_password)  # Gmail 로그인
                # print("이메일 전송 시도...")
                server.send_message(msg)
                # print("이메일 전송 성공")
        except Exception as e:
            error_msg = f"메일 발송 실패 - 상세 오류: {str(e)}"
            print(error_msg)
            print(f"상세 에러 정보: {type(e).__name__}")
            raise HTTPException(
                status_code=500,
                detail=error_msg
            )

## 3. JWT
class JWTManage:
    def __init__(self, db: Session):
        self.db = db
        self.secret_key = os.getenv('JWT_SECRET_KEY')
        self.access_token_expire_minutes = 60
        self.refresh_token_expire_days = 7
        self.algorithm = "HS256"
        
        try:
            redis_host = os.getenv('REDIS_HOST')
            redis_port = int(os.getenv('REDIS_PORT', 6379))
            redis_password = os.getenv('REDIS_PASSWORD')
            
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                password=redis_password,
                db=0,
                decode_responses=True
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Redis 연결 실패: {str(e)}"
            )
    
    def create_access_token(self, user: Users) -> str:
        current_time = datetime.now()
        expire_time = current_time + timedelta(minutes=self.access_token_expire_minutes)
        data = {
            "user_id": user.user_id,
            "email": user.email,
            "token_type": "access",
            "exp": int(expire_time.timestamp()),
            "iat": int(current_time.timestamp())
        }
        return jwt.encode(data, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: int) -> str:
        current_time = datetime.now()
        expire_time = current_time + timedelta(minutes=self.access_token_expire_minutes)
        data = {
            "user_id": user_id,
            "token_type": "refresh",
            "exp": int(expire_time.timestamp()),
            "iat": int(current_time.timestamp())
        }
        return jwt.encode(data, self.secret_key, algorithm=self.algorithm)
        
    def verify_token(self, token: str):
        try:
            if self.redis_client and self.redis_client.get(f"logout:{token}"):
                raise HTTPException(status_code=401, detail="이미 로그아웃된 토큰입니다.")
            
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # 토큰 발급 시간 검증
            if "iat" not in payload:
                raise HTTPException(status_code=401, detail="토큰이 유효하지 않습니다.")
            
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="토큰의 기간이 만료되었습니다.")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="사용할 수 없는 토큰입니다.")

## 4. 로그인
class UserLogin:
    def __init__(self, db: Session, jwt_manage: JWTManage):
        self.db = db
        self.jwt_manage = jwt_manage
        self.pwd_context = CryptContext(schemes=["bcrypt"])

    async def login(self, login_data: UserSignIn) -> TokenResponse:
        # 이메일 검증
        user = self.db.query(Users).filter(Users.email == login_data.email).first()
        if not user:
            raise HTTPException(
                status_code=401,
                detail="존재하지 않거나 틀린 사용자입니다."
            )
        # 비밀번호 검증
        if not self.pwd_context.verify(login_data.password, user.password):
            raise HTTPException(
                status_code=401,
                detail="비밀번호가 틀렸습니다."
            )
        
        token_data = {
            "access_token": self.jwt_manage.create_access_token(user),
            "refresh_token": self.jwt_manage.create_refresh_token(user.user_id)
        }
        
        return TokenResponse.model_validate(token_data)

## 5. 로그아웃
class UserLogout:
    def __init__(self, db: Session):
        self.db = db
        
        try:
            redis_host = os.getenv('REDIS_HOST')
            redis_port = int(os.getenv('REDIS_PORT', 6379))
            redis_password = os.getenv('REDIS_PASSWORD')
            
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                password=redis_password,
                db=0,
                decode_responses=True
            )
            self.redis_client.ping()
            
        except Exception as e:
            raise Exception(f"Redis 연결 실패: {str(e)}")
        
    async def logout(self, access_token: str):
        try:
            if self.redis_client.exists(f"logout:{access_token}"):
                raise HTTPException(status_code=401, detail="이미 로그아웃된 토큰입니다.")
            
            jwt_manager = JWTManage(self.db)
            payload = jwt_manager.verify_token(access_token)
            
            expire_timestamp = payload.get('exp')
            if not expire_timestamp:
                raise HTTPException(status_code=400, detail="JWT 토큰 구조가 옳지 않습니다.")
            
            current_timestamp = int(datetime.now().timestamp())
            ttl = max(1, int(expire_timestamp - current_timestamp))
            
            if ttl > 0:
                self.redis_client.setex(f"logout:{access_token}", ttl, 1)
            
            return {"message": "로그아웃 되었습니다"}
        
        except HTTPException as http_exc:
            raise http_exc
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"로그아웃 처리 중 오류가 발생했습니다: {str(e)}"
            )    

## 권한파악
class Permissions:
    def __init__(self, db: Session, mongodb: Session):
        self.db = db
        self.collection_image_permissions = mongodb.get_collection("imagePermissions")
        self.collection_project_permissions = mongodb.get_collection("projectPermissions")
        self.collection_histories = mongodb.get_collection("histories")
        self.collection_images = mongodb.get_collection("images")
        
    async def get_image_permissions(self, user_id: int):
        try:
            user_department = self.db.query(Users).filter(Users.user_id == user_id).first()
            if not user_department:
                raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
            project_department = self.db.query(Departments).filter(Departments.department_id == user_department.department_id).first()
            
            department_name = project_department.department_name if project_department else "None"
            
            image_permission_doc = await self.collection_image_permissions.find_one({})
            if not image_permission_doc or ("user" not in image_permission_doc and "department" not in image_permission_doc):
                raise HTTPException(status_code=403, detail="Permission Denied")
            
            if str(user_id) not in image_permission_doc["user"]:
                raise HTTPException(status_code=403, detail="Permission Denied")
            
            if department_name not in image_permission_doc["department"]:
                raise HTTPException(status_code=403, detail="Permission Denied")
            
            image_ids = set()

            image_ids.update(image_permission_doc['user'].get(str(user_id), []))
            image_ids.update(image_permission_doc['department'].get(department_name, []))
            
            return image_ids
        
        except HTTPException as http_exc:
            raise http_exc
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"권한 파악 중 오류가 발생했습니다: {str(e)}"
            )
            
    async def get_project_permissions_viewer(self, user_id: int, project_id: str):
        try:
            user_department = self.db.query(Users).filter(Users.user_id == user_id).first()
            if not user_department:
                raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
            project_department = self.db.query(Departments).filter(Departments.department_id == user_department.department_id).first()
            
            department_name = project_department.department_name if project_department else "None"
            
            project_permission_doc = await self.collection_project_permissions.find_one({})
            if not project_permission_doc or ("user" not in project_permission_doc and "department" not in project_permission_doc):
                raise HTTPException(status_code=403, detail="Permission Denied")
            
            if str(user_id) not in project_permission_doc["user"]:
                raise HTTPException(status_code=403, detail="Permission Denied")
            
            if department_name not in project_permission_doc["department"]:
                raise HTTPException(status_code=403, detail="Permission Denied")
            
            user_permissions = project_permission_doc["user"].get(str(user_id), {"view": [], "edit": []})
            department_permissions = project_permission_doc["department"].get(department_name, {"view": [], "edit": []})
            
            project_ids = set()
            if "view" in user_permissions:
                project_ids.update(user_permissions["view"])
            if "edit" in user_permissions:
                project_ids.update(user_permissions["edit"])
            if "view" in department_permissions:
                project_ids.update(department_permissions["view"])
            if "edit" in department_permissions:
                project_ids.update(department_permissions["edit"])
            
            return project_ids
        
        except HTTPException as http_exc:
            raise http_exc
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"권한 파악 중 오류가 발생했습니다: {str(e)}"
            )
            
    async def get_project_permissions_editor(self, user_id: int, project_id: str):
        try:
            user_department = self.db.query(Users).filter(Users.user_id == user_id).first()
            if not user_department:
                raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
            project_department = self.db.query(Departments).filter(Departments.department_id == user_department.department_id).first()
            
            department_name = project_department.department_name if project_department else "None"
            
            project_permission_doc = await self.collection_project_permissions.find_one({})
            if not project_permission_doc or ("user" not in project_permission_doc and "department" not in project_permission_doc):
                raise HTTPException(status_code=403, detail="Permission Denied")
            
            if str(user_id) not in project_permission_doc["user"]:
                raise HTTPException(status_code=403, detail="Permission Denied")
            
            if department_name not in project_permission_doc["department"]:
                raise HTTPException(status_code=403, detail="Permission Denied")
            
            user_permissions = project_permission_doc["user"].get(str(user_id), {"view": [], "edit": []})
            department_permissions = project_permission_doc["department"].get(department_name, {"view": [], "edit": []})
            
            project_ids = set()
            if "edit" in user_permissions:
                project_ids.update(user_permissions["edit"])
            if "edit" in department_permissions:
                project_ids.update(department_permissions["edit"])
            
            return project_ids
        
        except HTTPException as http_exc:
            raise http_exc
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"권한 파악 중 오류가 발생했습니다: {str(e)}"
            )
            
    async def _get_history_id_to_project_id(self, history_id: str):
        try:
            document = await self.collection_histories.find_one({"_id": ObjectId(history_id)})
            if document:
                project_id = document.get("projectId", "")
                return str(project_id)
            else:
                raise HTTPException(
                status_code=500,
                detail=f"History가 없습니다: {str(e)}"
            )
        
        except HTTPException as http_exc:
            raise http_exc
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"권한 파악 중 오류가 발생했습니다: {str(e)}"
            )