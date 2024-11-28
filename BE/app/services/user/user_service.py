from dotenv import load_dotenv

from utils.timezone import get_current_time
from dto.users_dto import UserProfileResponse, UserProfileUpdateRequest
from fastapi import HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from models.mariadb_users import Users, Departments
from utils.timezone import get_current_time

from dto.pagination_dto import PaginationDto
from dto.project_dto import ProjectResponse, UserResponse
from typing import List

load_dotenv()

## 유저 프로필
class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.pwd_context = CryptContext(schemes=["bcrypt"])

    def _get_user_with_department(self, user_id: int) -> Users | None:
        """사용자 정보를 부서 정보와 함께 조회합니다."""
        return self.db.query(Users).filter(Users.user_id == user_id).first()

    def get_profile(self, user_id: int) -> UserProfileResponse:
        try:
            user = self._get_user_with_department(user_id)
            departments = self.db.query(Departments).filter(Departments.department_id == user.department_id).first()
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail="사용자를 찾을 수 없습니다."
                )

            return UserProfileResponse(
                user_id=user.user_id,
                name=user.name,
                email=user.email,
                duty=user.duty,
                location=user.location,
                department_id=user.department_id,
                department_name=departments.department_name if user.departments else None,
                is_supervised=user.is_supervised,
                created_at=user.created_at,
                updated_at=user.updated_at
            )
        except HTTPException as http_exc:
            raise http_exc
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"프로필 정보를 불러올 수 없습니다: {str(e)}"
            )

    def update_profile(self, user_id: int, profile_data: UserProfileUpdateRequest) -> UserProfileResponse:
        try:
            user = self._get_user_with_department(user_id)
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail="사용자를 찾을 수 없습니다."
                )

            has_changes = False

            # 비밀번호 변경
            if profile_data.current_password and profile_data.new_password:
                if not self.pwd_context.verify(profile_data.current_password, user.password):
                    raise HTTPException(
                        status_code=400,
                        detail="현재 비밀번호가 일치하지 않습니다."
                    )
                user.password = self.pwd_context.hash(profile_data.new_password)
                has_changes = True

            # 기본 정보 업데이트
            for field, value in {
                'name': profile_data.name,
                'duty': profile_data.duty,
                'department_id': profile_data.department_id,
                'location': profile_data.location
            }.items():
                if value and getattr(user, field) != value:
                    setattr(user, field, value)
                    has_changes = True

            if has_changes:
                user.updated_at = get_current_time()
                self.db.commit()
                self.db.refresh(user)

            return self.get_profile(user_id)

        except HTTPException as http_exc:
            self.db.rollback()
            raise http_exc
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"프로필 수정 중 오류가 발생했습니다: {str(e)}"
            )

    # 2-2. 이름 검색
    async def search_user_name(self, user_name: str | None = None, page : int = 1, limit : int = 10) -> PaginationDto[List[ProjectResponse] | None]:
        skip = (page - 1) * limit

        if user_name:
            users = self.db.query(Users).filter(Users.name.like(f"%{user_name}%")).offset(skip).limit(limit).all()
            total_user = self.db.query(Users).filter(Users.name.like(f"%{user_name}%")).count()
        else:
            users = self.db.query(Users).offset(skip).limit(limit).all()
            total_user = self.db.query(Users).count()

        user_list = []
        for user in users:
            departments = self.db.query(Departments).filter(Departments.department_id == user.department_id).first()
            user_one = UserResponse(
                user_id = user.user_id,
                name = user.name,
                email = user.email,
                department_name = departments.department_name if departments else None
            )
            user_list.append(user_one)

        total_pages = (total_user + limit - 1) // limit

        response = {
            "data": user_list,
            "page": page,
            "limit": limit,
            "total_count": total_user,
            "total_pages": total_pages
        }

        return response