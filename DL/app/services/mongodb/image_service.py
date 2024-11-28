from fastapi import HTTPException
from typing import List
from configs.mongodb import collection_images, collection_project_images, collection_image_permissions, collection_image_models
from models.feature_models import Feature
from models.image_models import ImageData
from datetime import datetime, timezone

class ImageService:
    def __init__(self):
        pass

    def _create_images(self, metadata_id: str, feature_id: str, label_id: str = None) -> ImageData:
        image_obj = {
            "metadataId": metadata_id,
            "featureId": feature_id,
            "labelId": label_id,
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }

        return ImageData.model_validate(image_obj)

    # 차원축소 기록 저장 (mongodb)
    async def save_images_mongodb(self, metadata_id: str, feature_id: str, label_id: str = None):
        try:
            image_obj = self._create_images(metadata_id, feature_id, label_id)
            result = await collection_images.insert_one(image_obj.model_dump())

            if result.inserted_id:
                return str(result.inserted_id)
            else:
                raise HTTPException(status_code=500, detail="Failed to save images")
        except Exception as e:
            raise Exception(f"Failed to update results: {str(e)}")

    async def mapping_project_images_mongodb(self, project_id: str, image_id: str):
        try:
            existing_doc = await collection_project_images.find_one()

            # 문서가 없을 경우 새로운 문서 생성
            if existing_doc is None:
                new_document = {
                    "project": {}
                }
                await collection_project_images.insert_one(new_document)
                existing_doc = new_document

            current_images = existing_doc.get("project", {}).get(str(project_id))

            if current_images is None:
                current_images = []

            updated_images = list(set(current_images + [image_id]))

            await collection_project_images.update_one(
                {},
                {
                    "$set": {
                        f"project.{str(project_id)}": updated_images
                    }
                }
            )
        except Exception as e:
            raise Exception(f"Failed to update results: {str(e)}")

    async def mapping_image_permissions_mongodb(self, user_id: int, department_name: str, project_id: str, image_id: str):
        try:
            existing_doc = await collection_image_permissions.find_one()

            # 문서가 없을 경우 새로운 문서 생성
            if existing_doc is None:
                new_document = {
                    "user": {},
                    "department": {},
                    "project": {}
                }
                await collection_image_permissions.insert_one(new_document)
                existing_doc = new_document

            user_permissions = existing_doc.get("user", {}).get(str(user_id), [])
            department_permissions = existing_doc.get("department", {}).get(str(department_name), [])
            project_permissions = existing_doc.get("project", {}).get(str(project_id), [])

            # 권한 업데이트
            updated_user_permissions = list(set(user_permissions + [image_id]))
            updated_department_permissions = list(set(department_permissions + [image_id]))
            updated_project_permissions = list(set(project_permissions + [image_id]))

            # 업데이트할 데이터 구성
            update_data = {
                "user": existing_doc.get("user", {}),
                "department": existing_doc.get("department", {}),
                "project": existing_doc.get("project", {})
            }
            
            # 데이터 업데이트
            update_data["user"][str(user_id)] = updated_user_permissions
            update_data["department"][str(department_name)] = updated_department_permissions
            update_data["project"][str(project_id)] = updated_project_permissions

            # MongoDB 업데이트
            await collection_image_permissions.update_one(
                {},
                {"$set": update_data}
            )
            
        except Exception as e:
            raise Exception(f"Failed to update results: {str(e)}")
        
    async def mapping_image_model_mongodb(self, image_id: str, model_name: str):
        try:
            # 문서가 존재하는지 확인
            existing_document = await collection_image_models.find_one({})
            
            if not existing_document:
                # 문서가 없으면 생성
                new_document = {
                    "models": {
                        model_name: [image_id]
                    }
                }
                await collection_image_models.insert_one(new_document)
                print("New document created.")
            else:
                # 문서가 있으면 업데이트
                await collection_image_models.update_one(
                    {"_id": existing_document.get("_id")},
                    {
                        "$addToSet": {f"models.{model_name}": image_id}  # 중복 없이 추가
                    }
                )
                print("Document updated.")
        except Exception as e:
            raise Exception(f"Failed to mapping image to models: {str(e)}")