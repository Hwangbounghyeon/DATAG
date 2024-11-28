from bson import ObjectId
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.mariadb_users import Users, Departments
from dto.image_detail_dto import ImageDepartmentPermissionRemoveResponse, ImageUserPermissionRemoveResponse, ImageDepartmentPermissionAddResponse, ImageUserPermissionAddResponse, ImageDepartmentPermissionRemoveRequest, ImageUserPermissionRemoveRequest, ImageDepartmentPermissionAddRequest, ImageDetailTagAddRequest, ImageDetailTagAddResponse, ImageDetailTagRemoveRequest, ImageDetailTagRemoveResponse, ImageUserPermissionAddRequest, UserDetail

class ImageExtraService:
    def __init__(self, db: Session, mongodb: Session):
        self.db = db
        self.collection_metadata = mongodb.get_collection("metadata")
        self.collection_images = mongodb.get_collection("images")
        self.collection_tag_images = mongodb.get_collection("tagImages")
        self.collection_image_permissions = mongodb.get_collection("imagePermissions")

    
    # 1. 태그 추가
    async def add_image_tag(self, request: ImageDetailTagAddRequest) -> ImageDetailTagAddResponse:

        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###

        # metadata -> tags
        await self.collection_metadata.update_one(
            {"_id": ObjectId(metadata_id)},
            {
                "$addToSet": {
                    "aiResults.0.predictions.0.tags": {"$each": request.tag_list}
                }
            }
        )

        # tagImages
        for tag in request.tag_list:
            await self.collection_tag_images.update_one(
                {},
                {
                    "$addToSet": {
                        f"tag.{tag}": request.image_id
                    }
                }
            )

        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###

        tag_name_list = metadata_one.get("aiResults", [{}])[0].get("predictions", [{}])[0].get("tags", [])
        # 4. 응답 반환
        try:
            return {
                "image_id": image_id,
                "tag_name_list": tag_name_list
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"이미지 정보 조회 중 오류가 발생했습니다: {str(e)}"
            )
        
    # 2. 태그 삭제
    async def delete_image_tag(self, request: ImageDetailTagRemoveRequest) -> ImageDetailTagRemoveResponse:
        
        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###

        # metadata -> tags
        await self.collection_metadata.update_one(
            {"_id": ObjectId(metadata_id)},
            {
                "$pull": {
                    "aiResults.0.predictions.0.tags": {"$in": request.remove_tag_list}
                }
            }
        )

        # tagImages
        for tag in request.remove_tag_list:
            await self.collection_tag_images.update_one(
                {},
                {
                    "$pull": {
                        f"tag.{tag}": image_id
                    }
                }
            )

        # tagImages -> tagDatas
        tag_datas = await self.collection_tag_images.find_one()
        
        # 빈 배열이 된 태그 필드 삭제
        for tag, images in tag_datas.get("tag", {}).items():
            if not images:  # 빈 배열인 경우
                await self.collection_tag_images.update_one(
                    {},
                    {"$unset": {f"tag.{tag}": ""}}
                )

        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])

        tags = metadata_one.get("aiResults", [{}])[0].get("predictions", [{}])[0].get("tags", [])
        ###

        # result
        try:
            return {
                "image_id": image_id,
                "tag_name_list": tags
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"이미지 정보 조회 중 오류가 발생했습니다: {str(e)}"
            )
    
    # 3. 유저 권한 추가
    async def add_user_image_permission(self, request: ImageUserPermissionAddRequest) -> ImageUserPermissionAddResponse:
        
        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###

        # metadata -> users
        await self.collection_metadata.update_one(
            {"_id": ObjectId(metadata_id)},
            {
                "$addToSet": {
                    "metadata.accessControl.users": {"$each": request.user_id_list}
                }
            }
        )

        # imagePermissions -> user
        for user_id in request.user_id_list:
            await self.collection_image_permissions.update_one(
                {},
                {
                    "$addToSet": {
                        f"user.{user_id}": request.image_id
                    }
                }
            )
        
        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###

        access_control_one = metadata_one.get("metadata").get("accessControl")
        users = access_control_one.get("users")
        
        # departments 값이 None, 빈 문자열, 혹은 비어있는 경우 빈 리스트로 기본값 설정
        departments = access_control_one.get("departments")
        if not isinstance(departments, list) or any(department == '' for department in departments):
            departments = []

        # users
        auth_list = []
        for user in users:
            user_one = self.db.query(Users).filter(Users.user_id.like(f"%{user}%")).first()
            if user_one is None:
                continue  # 일치하는 사용자가 없으면 건너뜁니다.
            department_id = user_one.department_id
            department_one = self.db.query(Departments).filter(Departments.department_id == department_id).first()
            department_name = department_one.department_name if department_one else "Unknown Department"
            user_information = UserDetail(
                user_id=user_one.user_id,
                user_name=user_one.name,
                department_name=department_name
            )
            auth_list.append(user_information)

        # 5. 응답 반환
        try:
            return {
                "image_id": image_id,
                "auth_list": auth_list
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"이미지 정보 조회 중 오류가 발생했습니다: {str(e)}"
            )

    # 4. 부서 권한 추가
    async def add_department_image_permission(self, request: ImageDepartmentPermissionAddRequest) -> ImageDepartmentPermissionAddResponse:
        
        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###

        # metadata -> departments
        await self.collection_metadata.update_one(
            {"_id": ObjectId(metadata_id)},
            {
                "$addToSet": {
                    "metadata.accessControl.departments": {"$each": request.department_name_list}
                }
            }
        )

        # imagePermissions -> user
        for department_name in request.department_name_list:
            await self.collection_image_permissions.update_one(
                {},
                {
                    "$addToSet": {
                        f"department.{department_name}": request.image_id
                    }
                }
            )
        
        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###

        department_list = metadata_one.get("metadata").get("accessControl").get("departments")
        if not isinstance(department_list, list) or any(department == '' for department in department_list):
            department_list = []
        
        # 응답 반환
        try:
            return {
                "image_id": image_id,
                "department_list": department_list
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"이미지 정보 조회 중 오류가 발생했습니다: {str(e)}"
            )
        
    # 5. 유저 권한 삭제
    async def remove_user_image_permission(self, request: ImageUserPermissionRemoveRequest) -> ImageUserPermissionRemoveResponse:
        
        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###
        
        # 3. metadata에서 권한 삭제
        await self.collection_metadata.update_one(
            {"_id": ObjectId(metadata_id)},
            {
                "$pull": {
                    "metadata.accessControl.users": {"$in": request.user_id_list}
                }
            }
        )
        
        # 4. imagePermissions 에서 권한 삭제
        for user_id in request.user_id_list:
            await self.collection_image_permissions.update_one(
                {},
                {
                    "$pull": {
                        f"user.{user_id}": request.image_id
                    }
                }
            )
        
        # 업데이트된 user 데이터 다시 가져오기
        permission_datas = await self.collection_image_permissions.find_one()
        
        # 빈 배열이 된 태그 필드 삭제
        for user_id, images in permission_datas.get("user", {}).items():
            if not images:  # 빈 배열인 경우
                await self.collection_image_permissions.update_one(
                    {},
                    {"$unset": {f"user.{user_id}": ""}}
                )
        
        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###
        
        # 3. Access Control 정보 가져오기
        access_control_one = metadata_one.get("metadata").get("accessControl")
        users = access_control_one.get("users")
        
        # departments 값이 None, 빈 문자열, 혹은 비어있는 경우 빈 리스트로 기본값 설정
        departments = access_control_one.get("departments")
        if not isinstance(departments, list) or any(department == '' for department in departments):
            departments = []
        
        # 4. Users 정보 조회 및 가공
        auth_list = []
        for user in users:
            user_one = self.db.query(Users).filter(Users.user_id.like(f"%{user}%")).first()
            if user_one is None:
                continue  # 일치하는 사용자가 없으면 건너뜁니다.

            department_id = user_one.department_id
            department_one = self.db.query(Departments).filter(Departments.department_id == department_id).first()
            department_name = department_one.department_name if department_one else "Unknown Department"

            user_information = UserDetail(
                user_id=user_one.user_id,
                user_name=user_one.name,
                department_name=department_name
            )
            auth_list.append(user_information)
        
        # 응답 반환
        try:
            return {
                "image_id": image_id,
                "auth_list": auth_list
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"이미지 정보 조회 중 오류가 발생했습니다: {str(e)}"
            )

    # 6. 부서 권한 삭제
    async def remove_department_image_permission(self, request: ImageDepartmentPermissionRemoveRequest) -> ImageDepartmentPermissionRemoveResponse:
        
        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###
        
        # 3. metadata에서 권한 삭제
        await self.collection_metadata.update_one(
            {"_id": ObjectId(metadata_id)},
            {
                "$pull": {
                    "metadata.accessControl.departments": {"$in": request.department_name_list}
                }
            }
        )
        
        # 4. imagePermissions 에서 권한 삭제
        for department_id in request.department_name_list:
            await self.collection_image_permissions.update_one(
                {},
                {
                    "$pull": {
                        f"user.{department_id}": request.image_id
                    }
                }
            )
        
        # 업데이트된 user 데이터 다시 가져오기
        permission_datas = await self.collection_image_permissions.find_one()
        
        # 빈 배열이 된 태그 필드 삭제
        for department_name, images in permission_datas.get("department", {}).items():
            if not images:  # 빈 배열인 경우
                await self.collection_image_permissions.update_one(
                    {},
                    {"$unset": {f"department.{department_name}": ""}}
                )
        
        ### images, matadata
        image_id = request.image_id
        image_one = await self.collection_images.find_one({"_id": ObjectId(image_id)})
        if image_one is None:
            raise HTTPException(status_code=404, detail="Image not found")
        image_one["_id"] = str(image_one["_id"])

        metadata_id = image_one.get("metadataId")
        metadata_one = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
        if metadata_one is None:
            raise HTTPException(status_code=404, detail="Metadata not found")
        metadata_one["_id"] = str(metadata_one["_id"])
        ###
        
        department_list = metadata_one.get("metadata").get("accessControl").get("departments")
        if not isinstance(department_list, list) or any(department == '' for department in department_list):
            department_list = []
        
        # 응답 반환
        try:
            return {
                "image_id": image_id,
                "department_list": department_list
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"이미지 정보 조회 중 오류가 발생했습니다: {str(e)}"
            )