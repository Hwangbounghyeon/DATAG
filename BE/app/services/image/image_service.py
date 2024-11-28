from fastapi import HTTPException
from typing import List, Set

from math import ceil
from bson import ObjectId
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from dto.search_dto import TagImageResponse, SearchCondition, ImageSearchResponse
from dto.image_detail_dto import UserInformation, AccessControl, ImageDetailResponse
from dto.pagination_dto import PaginationDto
from models.mariadb_users import Users, Departments



load_dotenv()

## 1. tag 목록 불러오기
class ImageService:    
    def __init__(self, db: Session, mongodb: Session):
        self.db = db
        self.collection_tag_images = mongodb.get_collection("tagImages")
        self.collection_metadata = mongodb.get_collection("metadata")
        self.collection_images = mongodb.get_collection("images")
        self.collection_image_permissions = mongodb.get_collection("imagePermissions")
    
    async def get_tag(self) -> TagImageResponse:
        try:
            tag_doc = await self.collection_tag_images.find_one({})
            if not tag_doc:
                tags = []
            else:
                tags = list(tag_doc['tag'].keys()) if tag_doc and 'tag' in tag_doc else []

            # images 필드가 Dict[str, str] 형식으로 반환
            return TagImageResponse(
                tags=sorted(tags),
                # images=images  # {이미지 _id: 이미지 경로}
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"태그 목록과 이미지 경로 조회 중 오류가 발생했습니다: {str(e)}"
            )
    
    # 전체 이미지 유저 접근 권한 설정
    async def _get_user_permissions(self, user_id: int) -> Set[str]:
        try:
            user = self.db.query(Users).filter(Users.user_id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="사용자가 존재하지 않습니다.")
            
            department = self.db.query(Departments).filter(
                Departments.department_id == user.department_id
            ).first()
            department_name = department.department_name if department else None

            permissions = await self.collection_image_permissions.find_one({})
            if not permissions:
                return set()

            accessible_images = set()

            if 'user' in permissions and str(user_id) in permissions['user']:
                accessible_images.update(permissions['user'].get(str(user_id), []))

            if department_name and 'department' in permissions:
                accessible_images.update(permissions['department'].get(department_name, []))

            return accessible_images

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def _filter_by_permissions(self, image_ids: Set[str], user_id: int) -> Set[str]:
        accessible_images = await self._get_user_permissions(user_id)
        return image_ids & accessible_images
    
    # 2. 각 그룹별로 Tag 필터링
    async def _process_condition_group(self, tag_doc: dict, condition: SearchCondition) -> set:
        result_ids = None

        # AND 조건 처리
        if condition.and_condition:
            for tag in condition.and_condition:
                if tag in tag_doc['tag']:
                    current_ids = set(tag_doc['tag'][tag])
                    if result_ids is None:
                        result_ids = current_ids
                    else:
                        result_ids &= current_ids
                else:
                    return set()  # AND 조건 중 하나라도 매칭되지 않으면 빈 set 반환
            if result_ids is None:
                return set()  # AND 조건 중 하나라도 매칭되지 않으면 빈 set 반환

        # OR 조건 처리
        if condition.or_condition:
            or_ids = set()
            for tag in condition.or_condition:
                if tag in tag_doc['tag']:
                    or_ids.update(tag_doc['tag'][tag])
            if result_ids is None:
                result_ids = or_ids
            else:
                result_ids &= or_ids

        # 아직 result_ids가 None이면 모든 이미지 ID로 초기화
        if result_ids is None:
            result_ids = set()
            for tag_ids in tag_doc['tag'].values():
                result_ids.update(tag_ids)

        # NOT 조건 처리
        if condition.not_condition:
            exclude_ids = set()
            for tag in condition.not_condition:
                if tag in tag_doc['tag']:
                    exclude_ids.update(tag_doc['tag'][tag])
            result_ids -= exclude_ids

        return result_ids
    
    ## 3. 이미지 Tag 필터링하기(고급 검색 기능 - AND, OR, NOT)
    async def search_images_by_conditions(self, search_conditions: List[SearchCondition] | None, user_id: int, page: int = 1, limit: int = 10) -> PaginationDto[List[ImageSearchResponse]]:
        try:
            # 1. tag document 가져오기
            tag_doc = await self.collection_tag_images.find_one({})
            if not tag_doc:
                return {
                    "data": [],
                    "page": page,
                    "limit": limit,
                    "total_count": 0,
                    "total_pages": 0
                }
            if not search_conditions:
                allowed_images = await self._get_user_permissions(user_id)
                if not allowed_images:
                    return {
                        "data": [],
                        "page": page,
                        "limit": limit,
                        "total_count": 0,
                        "total_pages": 0
                    }
                object_ids = [ObjectId(id) for id in allowed_images]
            else:
                # 모든 조건 그룹을 처리하고 결과를 OR 연산으로 결합
                final_matching_ids = set()
                for condition in search_conditions:
                    group_result = await self._process_condition_group(tag_doc, condition)
                    final_matching_ids.update(group_result)
                
                if not final_matching_ids:
                    return {
                        "data": [],
                        "page": page,
                        "limit": limit,
                        "total_count": 0,
                        "total_pages": 0
                    }
                    
                allowed_images = await self._filter_by_permissions(final_matching_ids, user_id)
                if not allowed_images:
                    return {
                        "data": [],
                        "page": page,
                        "limit": limit,
                        "total_count": 0,
                        "total_pages": 0
                    }
                object_ids = [ObjectId(id) for id in allowed_images]
            
            # 전체 개수 조회
            base_query = {"_id": {"$in": object_ids}}
            total_count = await self.collection_images.count_documents(base_query)
            total_pages = (total_count + limit - 1) // limit

            # 페이지네이션을 위한 정렬 추가
            skip = (page - 1) * limit
            paginated_images = await self.collection_images.find(base_query).sort('createdAt', -1).skip(skip).limit(limit).to_list(length=None)


            # 매칭된 이미지 정보 조회
            metadata_ids = [ObjectId(image["metadataId"]) for image in paginated_images]
            metadata_docs = await self.collection_metadata.find(
                {"_id": {"$in": metadata_ids}},
                {"fileList": 1}
            ).to_list(length=None)

            metadata_dict = {str(doc["_id"]): doc.get("fileList", [])[0] for doc in metadata_docs}

            image_list = [
                ImageSearchResponse(images={str(image["_id"]): metadata_dict.get(str(image["metadataId"]))})
                for image in paginated_images
                if metadata_dict.get(str(image["metadataId"]))
            ]

            return {
                "data": image_list,
                "page": page,
                "limit": limit,
                "total_count": total_count,
                "total_pages": total_pages
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"이미지를 찾는 중 에러가 발생했습니다: {str(e)}"
            )
    
    # 1. 이미지 정보 가져오기
    async def read_image_detail(
        self,
        user_id: int,
        image_id: str,
        search_conditions: List[SearchCondition] | None
    ) -> ImageDetailResponse:
        allowed_images = await self._get_user_permissions(user_id)
        
        # images, metadata
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])

        # users, accessControl
        access_control_one = metadata_one.get("metadata").get("accessControl")
        users = access_control_one.get("users")
        departments = access_control_one.get("departments")
        if not isinstance(departments, list) or any(department == '' for department in departments):
            departments = []

        user_list = []
        for user in users:
            user_one = self.db.query(Users).filter(Users.user_id.like(f"%{user}%")).first()
            if user_one is None:
                continue
            department_id = user_one.department_id
            department_one = self.db.query(Departments).filter(Departments.department_id == department_id).first()
            department_name = department_one.department_name if department_one else "Unknown Department"

            user_information = UserInformation(
                uid=user_one.user_id,
                name=user_one.name,
                department_name=department_name
            )
            user_list.append(user_information)
        
        access_control = AccessControl(
            users=user_list,
            departments=departments
        )

        object_ids = [ObjectId(id) for id in allowed_images]
        base_query = {"_id": {"$in": object_ids}}
        
        if search_conditions:
            tag_doc = await self.collection_tag_images.find_one({})
            final_matching_ids = set()
            for condition in search_conditions:
                group_result = await self._process_condition_group(tag_doc, condition)
                final_matching_ids.update(group_result)
            
            # 권한이 있는 이미지와 검색 조건을 만족하는 이미지의 교집합
            allowed_images = list(set(allowed_images) & final_matching_ids)
            object_ids = [ObjectId(id) for id in allowed_images]
            base_query = {"_id": {"$in": object_ids}}

        images = await self.collection_images.find(base_query).sort('createdAt', -1).to_list(length=None)
        image_ids = [str(image["_id"]) for image in images]
        
        if not image_ids:
            raise HTTPException(status_code=404, detail="No images found for this project")

        total_pages = len(image_ids)
        try:
            current_page = image_ids.index(image_id) + 1
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid image_id")

        next_cursor = image_ids[current_page] if len(image_ids) > current_page else None
        previous_cursor = image_ids[max(0, current_page - 2)] if current_page > 1 else None

        return {
            "metadata": metadata_one,
            "access_control": access_control,
            "pagination": {
                "previous_cursor": previous_cursor,
                "next_cursor": next_cursor,
                "current_page": current_page,
                "total_pages": total_pages
            }
        }