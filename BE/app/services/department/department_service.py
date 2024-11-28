from sqlalchemy.orm import Session
from dto.pagination_dto import PaginationDto
from dto.project_dto import ProjectResponse, DepartmentResponse, UserResponse
from models.mariadb_users import Users, Departments
from typing import List

# 2. 이름 검색 및 부서 불러오기
class DepartmentService:
    def __init__(self, db: Session):
        self.db = db
    
    # 2-1. 부서 리스트 불러오기
    async def get_department_list(self):
        departments = self.db.query(Departments).all()
        return [DepartmentResponse.model_validate(dept).model_dump() for dept in departments]
    
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
            user_one = UserResponse(
                user_id = user.user_id,
                name = user.name,
                email = user.email
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