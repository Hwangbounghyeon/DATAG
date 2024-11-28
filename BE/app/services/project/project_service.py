from dto.project_dto import ProjectRequest

from sqlalchemy.orm import Session
from utils.timezone import get_current_time
from bson import ObjectId

from fastapi import HTTPException
from sqlalchemy.orm import Session
from dto.search_dto import SearchCondition, ImageSearchResponse

from dto.pagination_dto import PaginationDto
from dto.project_dto import ProjectRequest, ProjectResponse, AddImageRequest, AddFilteringImageResponse
from dto.image_detail_dto import UserInformation, AccessControl, ImageDetailResponse
from models.mariadb_users import Users, Departments
from typing import List, Set

# 1. 프로젝트 생성, 삭제 및 불러오기
class ProjectService:
    def __init__(self, db: Session, mongodb: Session):
        self.db = db
        self.mongodb = mongodb
        self.collection_projects = mongodb.get_collection("projects")
        self.collection_project_permissions = mongodb.get_collection("projectPermissions")
        self.collection_tag_images = mongodb.get_collection("tagImages")
        self.collection_metadata = mongodb.get_collection("metadata")
        self.collection_images = mongodb.get_collection("images")
        self.collection_project_images = mongodb.get_collection("projectImages")
        self.collection_project_histories = mongodb.get_collection("projectHistories")
        self.collection_image_models = mongodb.get_collection("imageModels")
        self.collection_image_permissions = mongodb.get_collection("imagePermissions")
    
    # 1-1. Project 생성
    async def create_project(self, creator_user_id: int, request: ProjectRequest) -> str:
        
        user_department = self.db.query(Users).filter(Users.user_id == creator_user_id).first()
        if not user_department:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        project_department = self.db.query(Departments).filter(Departments.department_id == user_department.department_id).first()
        
        department_name = project_department.department_name if project_department else "None"

        # project 생성
        project = {
            'projectName':request.project_name,
            'task':request.project_model_task,
            'modelName':request.project_model_name,
            'description':request.description,
            'userId':creator_user_id,
            'department': department_name,
            'isPrivate':request.is_private,
            'createdAt':get_current_time(),
            'updatedAt':get_current_time()
        }
        
        new_project = await self.collection_projects.insert_one(project)
        project_id = str(new_project.inserted_id)
        
        document = await self.collection_project_permissions.find_one()
        
        # 문서가 없을 경우 새로운 문서 생성
        if document is None:
            new_document = {
                "user": {},
                "department": {}
            }
            await self.collection_project_permissions.insert_one(new_document)
            document = new_document

        if str(creator_user_id) not in document.get("user", {}):
            await self.collection_project_permissions.update_one(
                {},
                {"$set": {f"user.{str(creator_user_id)}": {"view": [], "edit": []}}}
            )
        await self.collection_project_permissions.update_one(
            {},
            {"$addToSet": {f"user.{str(creator_user_id)}.edit": project_id}}
        )

        if department_name not in document.get("department", {}):
            await self.collection_project_permissions.update_one(
                {},
                {"$set": {f"department.{department_name}": {"view": [], "edit": []}}}
            )
        await self.collection_project_permissions.update_one(
            {},
            {"$addToSet": {f"department.{department_name}.edit": project_id}}
        )

        for user_id in request.accesscontrol.view_users:
            user_key = f"user.{user_id}"
            if user_id not in document.get("user", {}):
                # `user` 내에 해당 ID가 없으면 새로운 리스트 추가
                await self.collection_project_permissions.update_one(
                    {},
                    {"$set": {user_key: {"view": [], "edit": []}}}
                )
            # view 리스트에 project_id 추가
            await self.collection_project_permissions.update_one(
                {},
                {"$addToSet": {f"{user_key}.view": project_id}}
            )
            
        for user_id in request.accesscontrol.edit_users:
            user_key = f"user.{user_id}"
            if user_id not in document.get("user", {}):
                await self.collection_project_permissions.update_one(
                    {},
                    {"$set": {user_key: {"view": [], "edit": []}}}
                )
            await self.collection_project_permissions.update_one(
                {},
                {"$addToSet": {f"{user_key}.edit": project_id}}
            )

        # `department` 리스트에 project_id 추가 또는 키 생성
        for department in request.accesscontrol.view_departments:
            department_key = f"department.{department}"
            if department not in document.get("department", {}):
                # `department` 내에 해당 부서가 없으면 새로운 리스트 추가
                await self.collection_project_permissions.update_one(
                    {"_id": document["_id"]},
                    {"$set": {department_key: {"view": [], "edit": []}}}
                )
            # view 리스트에 project_id 추가
            await self.collection_project_permissions.update_one(
                {"_id": document["_id"]},
                {"$addToSet": {f"{department_key}.view": project_id}}
            )
            
        for department in request.accesscontrol.edit_departments:
            department_key = f"department.{department}"
            if department not in document.get("department", {}):
                await self.collection_project_permissions.update_one(
                    {"_id": document["_id"]},
                    {"$set": {department_key: {"view": [], "edit": []}}}
                )
            await self.collection_project_permissions.update_one(
                {"_id": document["_id"]},
                {"$addToSet": {f"{department_key}.edit": project_id}}
            )
        
        return project_id
    
    # 1-2. 프로젝트 리스트 불러오기
    async def get_project_list(
        self,
        user_id: int,
        model_name: str | None = None,
        page: int = 1,
        limit: int = 10
    ) -> PaginationDto[List[ProjectResponse] | None]:

        skip = (page - 1) * limit
        
        user_department = self.db.query(Users).filter(Users.user_id == user_id).first()
        if not user_department:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        project_department = self.db.query(Departments).filter(Departments.department_id == user_department.department_id).first()
        department_name = project_department.department_name if project_department else "None"

        user_permissions = await self.collection_project_permissions.find_one({f"user.{user_id}": {"$exists": True}})
        department_permissions = await self.collection_project_permissions.find_one({f"department.{department_name}": {"$exists": True}})

        viewable_project_ids_user = set()
        user_edit_permissions = set()
        # 사용자 권한이 없을 경우 빈 리스트 반환
        if user_permissions:
            # 특정 user_id의 view 및 edit 권한 가져오기
            user_view_permissions = set(user_permissions["user"].get(str(user_id), {}).get("view", []))
            user_edit_permissions = set(user_permissions["user"].get(str(user_id), {}).get("edit", []))

            viewable_project_ids_user = user_view_permissions | user_edit_permissions

        viewable_project_ids_department = set()
        department_edit_permissions = set()
        if department_permissions:
            # 특정 user_id의 view 및 edit 권한 가져오기
            department_view_permissions = set(department_permissions["department"].get(str(department_name), {}).get("view", []))
            department_edit_permissions = set(department_permissions["department"].get(str(department_name), {}).get("edit", []))

            viewable_project_ids_department = department_view_permissions | department_edit_permissions

        # view 및 edit 권한의 프로젝트 ID 합집합 구하기
        viewable_project_ids = viewable_project_ids_user | viewable_project_ids_department
        edit_project_ids = user_edit_permissions | department_edit_permissions

        # 조회할 프로젝트가 없으면 빈 리스트 반환
        if not viewable_project_ids:
            response = {
                "data": None,
                "page": page,
                "limit": limit,
                "total_count": 0,
                "total_pages": page
            }
            return response

        # MongoDB 쿼리 생성
        query = {
            "$and": [
                {"_id": {"$in": [ObjectId(pid) for pid in viewable_project_ids]}},
                {
                    "$or": [
                        {"isPrivate": False},  # 공개 프로젝트
                        {
                            "$and": [
                                {"isPrivate": True},
                                {"userId": user_id}  # private이면서 본인 프로젝트
                            ]
                        }
                    ]
                }
            ]
        }
        
        if model_name:
            query["$and"].append({"modelName": model_name})
        
        # MongoDB 쿼리 실행 및 페이지네이션
        projects = await self.collection_projects.find(query).skip(skip).limit(limit).to_list(length=limit)
        projects.sort(key=lambda x: x['updatedAt'], reverse=True)

        # 결과 형식 맞추기
        results = [
            ProjectResponse(
                project_id=str(project["_id"]),
                project_name=project["projectName"],
                task=project.get("task", ""),
                model_name=project.get("modelName", ""),
                department=project.get("department", ""),
                user_id=project.get("userId", 0),
                description=project.get("description", ""),
                is_private=project.get("isPrivate", False),
                created_at=project.get("createdAt", ""),
                updated_at=project.get("updatedAt", ""),
                is_editor=str(project["_id"]) in edit_project_ids,
                is_creator=project.get("userId", 0) == user_id
            )
            for project in projects
        ]
        
        total_projects = await self.collection_projects.count_documents(query)
        total_pages = (total_projects + limit - 1) // limit

        response = {
            "data": results,
            "page": page,
            "limit": limit,
            "total_count": total_projects,
            "total_pages": total_pages
        }

        return response
        
    # 1-3. 프로젝트 삭제
    async def delete_project(self, project_id: str):
        # 1. projects에서 삭제
        delete_projects = await self.collection_projects.delete_one({"_id": ObjectId(project_id)})
        if delete_projects.deleted_count == 0:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")
        
        # 2. projectPermissions에서 삭제
        permissions = await self.collection_project_permissions.find_one()
        users = permissions.get("user")
        departments = permissions.get("department")
        for i in users:
            await self.collection_project_permissions.update_many(
                {},
                {"$pull": {f"user.{i}.view": project_id, f"user.{i}.edit": project_id}}
            )
        for j in departments:
            await self.collection_project_permissions.update_many(
                {},
                {"$pull": {f"department.{j}.view": project_id, f"department.{j}.edit": project_id}}
            )
        
        # 3. projectHistories에서 삭제
        await self.collection_project_histories.update_one(
            {},
            {"$pull": {f"project.{project_id}": {"$exists": True}}}
        )

        # 4. metadata 에서 삭제
        projectImages = await self.collection_project_images.find_one({"project": project_id})
        if projectImages and "project" in projectImages and projectImages["project"]:
            for m in projectImages["project"]:
                images = await self.collection_images.find_one({"_id": ObjectId(m)})
                if images and "metadataId" in images:
                    imageMetadataId = images["metadataId"]
                    await self.collection_metadata.update_one(
                        {"_id": ObjectId(imageMetadataId)},
                        {"$pull": {"metadata.accessControl.projects": project_id}}
                    )

        # 5. projectImages에서 삭제
        await self.collection_project_images.update_one(
            {},
            {"$pull": {f"project.{project_id}": {"$exists": True}}}
        )

        # 6. 빈 배열 삭제 (project_histories가 None이 아닌 경우에만 처리)
        project_histories = await self.collection_project_histories.find_one()
        if project_histories:
            for project, image in project_histories.get("project", {}).items():
                if not image:
                    await self.collection_project_histories.update_one(
                        {},
                        {"$unset": {f"project.{project}": ""}}
                    )
        project_images = await self.collection_project_images.find_one()
        if project_images:
            for project, image in project_images.get("project", {}).items():
                if not image:
                    await self.collection_project_images.update_one(
                        {},
                        {"$unset": {f"project.{project}": ""}}
                    )

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
                return set()

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

    async def search_project_images(self, project_id: str, search_conditions: List[SearchCondition] | None, page: int = 1,limit: int = 10) -> PaginationDto[ImageSearchResponse]:
        try:
            # 1. project_images 가져오기
            project_images = await self.collection_project_images.find_one({})
            if not project_images or "project" not in project_images:
                return {
                    "data": ImageSearchResponse(images={}),
                    "page": page,
                    "limit": limit,
                    "total_count": 0,
                    "total_pages": 1
                }

            project_image_ids = set(project_images["project"].get(project_id, []))
            if not project_image_ids:
                return {
                    "data": ImageSearchResponse(images={}),
                    "page": page,
                    "limit": limit,
                    "total_count": 0,
                    "total_pages": 1
                }
            
            # 2. conditions 처리
            tag_doc = await self.collection_tag_images.find_one({})
            if not tag_doc:
                return {
                    "data": ImageSearchResponse(images={}),
                    "page": page,
                    "limit": limit,
                    "total_count": 0,
                    "total_pages": 1
                }

            if not search_conditions:
                final_matching_ids = project_image_ids
            else:
                final_matching_ids = set()
                for condition in search_conditions:
                    group_result = await self._process_condition_group(tag_doc, condition)
                    final_matching_ids.update(group_result)
                
                if not final_matching_ids:
                    return {
                        "data": ImageSearchResponse(images={}),
                        "page": page,
                        "limit": limit,
                        "total_count": 0,
                        "total_pages": 1
                    }
                
                final_matching_ids &= project_image_ids
            
            if not final_matching_ids:
                return {
                    "data": ImageSearchResponse(images={}),
                    "page": page,
                    "limit": limit,
                    "total_count": 0,
                    "total_pages": 1
                }
            
            # 3. 페이지네이션 및 정렬
            object_ids = [ObjectId(id) for id in final_matching_ids]
            base_query = {"_id": {"$in": object_ids}}
            
            total_count = await self.collection_images.count_documents(base_query)
            total_pages = (total_count + limit - 1) // limit
            total_pages = 1 if total_pages == 0 else total_pages

            skip = (page - 1) * limit
            paginated_images = await self.collection_images.find(base_query).sort('createdAt', 1).skip(skip).limit(limit).to_list(length=None)

            # 4. metadata 한 번에 조회
            metadata_ids = [ObjectId(image["metadataId"]) for image in paginated_images]
            metadata_docs = await self.collection_metadata.find(
                {"_id": {"$in": metadata_ids}},
                {"fileList": 1}
            ).to_list(length=None)

            metadata_dict = {str(doc["_id"]): doc.get("fileList", [])[0] for doc in metadata_docs}
            
            # 5. 결과 생성
            images = {
                str(image["_id"]): metadata_dict.get(str(image["metadataId"]))
                for image in paginated_images
                if metadata_dict.get(str(image["metadataId"]))
            }

            # ImageSearchResponse 생성
            response = ImageSearchResponse(images=images)

            return {
                "data": response,
                "page": page,
                "limit": limit,
                "total_count": total_count,
                "total_pages": total_pages
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # 3. 모델 리스트 호출
    async def get_model_list(self):
        model_list = {
            "cls": ["efficientnet_v2_s", "convnext_base", "regnet_y_3_2gf"],
            "det": ["yolov5n", "yolov8n", "yolo11n"]
        }
        
        return model_list
    
    # 4. 선택한 이미지를 project에 저장
    async def get_add_image(self, request: AddImageRequest):
        document = self.collection_project_images.find_one({"project." + request.project_id: {"$exists": True}})
    
        if not document:
            raise HTTPException(status_code=404, detail="Project ID not found")

        result = self.collection_project_images.update_one(
            {"_id": document["_id"]},
            {"$set": {f"project.{request.project_id}": request.image_ids}}
        )
        
        if result.modified_count > 0:
            return "Image를 성공적으로 업데이트하였습니다."
        else:
            raise HTTPException(status_code=500, detail="Image 업데이트에 실패하였습니다.")
        

    # 5. 필터링된 이미지를 project에 저장
    async def add_filter_image(self, project_id: str, project_conditions: List[SearchCondition] | None) -> AddFilteringImageResponse:
        try:
            # 비동기 결과를 먼저 받아온 후 접근
            tag_doc = await self.collection_tag_images.find_one({})
            if not tag_doc or "tag" not in tag_doc:
                return {
                    "project_id": project_id,
                    "image_list": []
                }
            
            tags = tag_doc["tag"]
            
            # project_conditions가 없을 경우 기본값을 할당
            if project_conditions:
                and_condition = project_conditions[0].and_condition if hasattr(project_conditions[0], 'and_condition') else []
                or_condition = project_conditions[0].or_condition if hasattr(project_conditions[0], 'or_condition') else []
                not_condition = project_conditions[0].not_condition if hasattr(project_conditions[0], 'not_condition') else []
            else:
                and_condition = []
                or_condition = []
                not_condition = []

            tag_and_images = []
            tag_or_images = []
            tag_not_images = []

            # AND 연산
            if and_condition:
                tag_and_images = [set(tags.get(i, [])) for i in and_condition]
                tag_and_images = set.intersection(*tag_and_images) if tag_and_images else set()
            else:
                tag_and_images = set()

            # OR 연산
            if or_condition:
                tag_or_images = [set(tags.get(i, [])) for i in or_condition]
                tag_or_images = set.union(*tag_or_images) if tag_or_images else set()
            else:
                tag_or_images = set()

            # NOT 연산
            if not_condition:
                tag_not_images = [set(tags.get(i, [])) for i in not_condition]
                tag_not_images = set.union(*tag_not_images) if tag_not_images else set()
            else:
                tag_not_images = set()

            # 최종 필터링된 이미지 목록 생성
            if not tag_or_images and tag_and_images:
                filtered_images = list((tag_and_images) - tag_not_images)
            elif not tag_and_images and tag_or_images:
                filtered_images = list((tag_or_images) - tag_not_images)
            elif tag_and_images and tag_or_images:
                filtered_images = list((tag_and_images & tag_or_images) - tag_not_images)
            else:
                filtered_images = set()
            
            project_one = await self.collection_projects.find_one({"_id": ObjectId(project_id)})
            project_modelName = project_one.get("modelName")
            image_models_one = await self.collection_image_models.find_one({})
            image_model_one = image_models_one.get("models").get(f"{project_modelName}")

            final_images = list((set(image_model_one) & set(filtered_images)))

            # 필터링된 이미지를 project에 저장
            if final_images:
                for image_id in final_images:
                    await self.collection_project_images.update_one(
                        {},
                        {
                            "$addToSet": {
                                f"project.{project_id}": image_id
                            }
                        }
                    )
                    await self.collection_image_permissions.update_one(
                        {},
                        {
                            "$addToSet": {
                                f"project.{project_id}": image_id
                            }
                        }
                    )
                    image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
                    metadata_id = image_one.get("metadataId")
                    await self.collection_metadata.update_one(
                        {"_id": ObjectId(metadata_id)},
                        {
                            "$addToSet": {
                                f"metadata.accessControl.projects": image_id
                            }
                        }
                    )
            
            return {
                "project_id": project_id,
                "image_list": final_images
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"이미지 정보 조회 중 오류가 발생했습니다: {str(e)}"
            )
        
        # 1. 이미지 정보 가져오기
    async def read_image_detail(
        self,
        project_id: str,
        image_id: str,
        search_conditions: List[SearchCondition] | None
    ) -> ImageDetailResponse:

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
        
        project = await self.collection_project_images.find_one({"project." + project_id: {"$exists": True}})
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # 프로젝트의 image 목록 가져오기
        images = project.get("project", {}).get(project_id, [])
        if not images:
            images = []

        if search_conditions:
            tag_doc = await self.collection_tag_images.find_one({})
            final_matching_ids = set()
            for condition in search_conditions:
                group_result = await self._process_condition_group(tag_doc, condition)
                final_matching_ids.update(group_result)

            images = list(set(images) & final_matching_ids)

        if not images:
            raise HTTPException(status_code=404, detail="No images found for this project")
        
        # images를 createdAt 기준으로 정렬
        object_ids = [ObjectId(img_id) for img_id in images]
        sorted_images = await self.collection_images.find(
            {"_id": {"$in": object_ids}}
        ).sort("createdAt", 1).to_list(length=None)

        # 정렬된 이미지 ID만 추출
        images = [str(img["_id"]) for img in sorted_images]

        total_pages = len(images)
        start_index = 0

        # image_id가 제공된 경우 start_index 설정
        if image_id:
            try:
                start_index = images.index(image_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid image_id")

        next_cursor = None
        previous_cursor = None

        current_page = start_index + 1
        
        # next_cursor 설정
        if len(images) > current_page:
            next_cursor = images[current_page]

        # previous_cursor 설정
        if start_index > 0:
            previous_cursor = images[max(0, start_index - 1)]

        # result
        try:
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
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"이미지 정보 조회 중 오류가 발생했습니다: {str(e)}"
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

    ## 3. 이미지 Tag 필터링하기 (모델 기준으로)
    async def search_model_images_by_conditions(self, search_conditions: List[SearchCondition] | None, user_id: int, projectId: str | None = None, page: int = 1, limit: int = 10) -> PaginationDto[List[ImageSearchResponse]]:
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
            else:
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
                
            if projectId:
                project = await self.collection_projects.find_one({"_id": ObjectId(projectId)})
                if not project:
                    return {
                        "data": [], 
                        "page": page,
                        "limit": limit,
                        "total_count": 0,
                        "total_pages": 0
                    }
                    
                    
                print(project)
                    
                model_name = project.get("modelName")
                
                
                print(model_name)
                image_models = await self.collection_image_models.find_one({})
                if not image_models:
                    return {
                        "data": [],
                        "page": page,
                        "limit": limit,
                        "total_count": 0,
                        "total_pages": 0
                    }
                model_image_ids = set(image_models.get("models", {}).get(model_name, []))
                allowed_images &= model_image_ids
            
            object_ids = [ObjectId(id) for id in allowed_images]       
            
            # 전체 개수 조회
            base_query = {"_id": {"$in": object_ids}}
            total_count = await self.collection_images.count_documents(base_query)
            total_pages = (total_count + limit - 1) // limit

            # 페이지네이션을 위한 정렬 추가
            skip = (page - 1) * limit
            paginated_images = await self.collection_images.find(base_query).sort('createdAt', 1).skip(skip).limit(limit).to_list(length=None)


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