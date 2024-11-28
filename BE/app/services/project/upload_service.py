from fastapi import  HTTPException
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import List, Dict
from requests.packages.urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter
from dotenv import load_dotenv
from bson import ObjectId
import mimetypes
import zipfile
import requests
import uuid
import io
import os
import json


from models.uploadbatch_models import UploadBatch
from models.mariadb_users import Departments, Users
from dto.uploads_dto import UploadRequest
from dto.upload_batch_dto import UploadBatchListData
from configs.s3 import upload_to_s3
from utils.timezone import get_current_time

BUCKENAME = 'ssafy-project'

load_dotenv()
class UploadService:
    def __init__(self, db : Session, mongodb: Session):
        self.db = db
        self.collection_upload_batches = mongodb.get_collection("uploadBatches")
        self.collection_user_upload_batches = mongodb.get_collection("userUploadBatches")
        self.collection_projects = mongodb.get_collection("projects")

    def is_image(self, filename : str):
        mime_type, _ = mimetypes.guess_type(filename)
        return mimetypes is not None and mime_type.startswith("image")

    # 메인 로직
    async def upload_image(self, upload_request: UploadRequest, files: list, user_id: int):
        user_department = self.db.query(Users).filter(Users.user_id == user_id).first()
        if not user_department:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        department_id = user_department.department_id

        if not files:
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")

        project = await self.collection_projects.find_one({"_id": ObjectId(upload_request.project_id)})
        task = project.get("task", "")
        model_name = project.get("modelName", "")

        inserted_id = await self._before_save_upload_batch(upload_request, user_id)

        await self._mapping_user_upload_batches(upload_request.project_id, user_id, inserted_id)

        file_data = await self._upload_s3(files)

        await self._analysis_data(upload_request, model_name, task, file_data, user_id, department_id)

        await self._after_save_upload_batch(inserted_id)

        return file_data
        
    async def _before_save_upload_batch(self, upload_request: UploadRequest, user_id: int) -> str:
        try:
            batch_obj = {
                "userId": user_id,
                "projectId": upload_request.project_id,
                "isDone": False,
                "createdAt": get_current_time(),
                "updatedAt": get_current_time()
            }

            batch_obj = UploadBatch.model_validate(batch_obj)

            result = await self.collection_upload_batches.insert_one(batch_obj.model_dump())

            if result.inserted_id:
                return str(result.inserted_id)
            else:
                raise HTTPException(status_code=500, detail="Failed to save cls metadata")
        except Exception as e:
            raise Exception(f"Failed to update results: {str(e)}")

    async def _upload_s3(self, files: list) -> Dict[str, List[Dict[str, str]]]:
        file_data = {
            "urls": [],
            "labels": []
        }
        
        json_labels = {}

        # 먼저 JSON 파일들을 처리하여 json_labels에 저장
        for filename, content in files:
            if filename.endswith(".json"):
                try:
                    json_content = json.loads(content)
                    json_labels.update(json_content)
                except json.JSONDecodeError:
                    raise HTTPException(status_code=400, detail="JSON파일의 형식이 틀립니다.")
                

        for filename, content in files:
            if filename.endswith(".json"):
                continue
        
            if filename.endswith("zip"):

                try:
                    with zipfile.ZipFile(io.BytesIO(content)) as zip_file:
                        extracted_files = zip_file.namelist()
                        
                        # ZIP 파일에서 JSON 파일 찾기 및 읽기
                        for filename in extracted_files:
                            if filename.endswith(".json"):
                                with zip_file.open(filename) as json_file:
                                    try:
                                        json_content = json.load(json_file)
                                        json_labels.update(json_content)
                                    except json.JSONDecodeError:
                                        raise HTTPException(status_code=400, detail="ZIP 파일 안의 JSON파일 형식이 틀립니다.")
                                    
                        for filename in extracted_files:
                            if not self.is_image(filename):
                                continue
                            
                            # ZIP 파일 내부에서 각 파일 읽기
                            with zip_file.open(filename) as extracted_file:
                                extracted_content = extracted_file.read()
                                memory_file = io.BytesIO(extracted_content)
                                memory_file.seek(0)

                                file_extension = os.path.splitext(extracted_file.name)[1]
                                file_name = f"{str(uuid.uuid4())}{file_extension}"

                                filename = os.path.basename(filename)

                                # S3에 파일 업로드
                                upload_to_s3(extracted_file, BUCKENAME, file_name)
                                s3_url = f"https://{BUCKENAME}.s3.us-east-2.amazonaws.com/{file_name}"
                                file_data["urls"].append(s3_url)
                                label_info = json_labels.get(filename, {"labels": [], "bounding_boxes": []})

                                file_data["labels"].append({
                                    "url": s3_url,
                                    "label": label_info.get("labels", []),
                                    "bounding_boxes": label_info.get("bounding_boxes", [])
                                })

                except zipfile.BadZipFile:
                    raise HTTPException(status_code=400, detail="Uploaded file is not a valid ZIP file.")
                except NoCredentialsError:
                    raise HTTPException(status_code=500, detail="AWS credentials not found.")
                except PartialCredentialsError:
                    raise HTTPException(status_code=500, detail="Incomplete AWS credentials.")
                except Exception as e:
                    raise HTTPException(status_code=500, detail=str(e))
                
            else:
                if not self.is_image(filename):
                    continue

                memory_file = io.BytesIO(content)
                memory_file.seek(0)
                file_extension = os.path.splitext(filename)[1]
                
                file_name = f"{str(uuid.uuid4())}{file_extension}"

                upload_to_s3(memory_file, BUCKENAME, file_name)
    
                s3_url = f"https://{BUCKENAME}.s3.us-east-2.amazonaws.com/{file_name}"
                file_data["urls"].append(s3_url)
                label_info = json_labels.get(filename, {"labels": [], "bounding_boxes": []})
                file_data["labels"].append({
                    "url": s3_url,
                    "label": label_info.get("labels", []),
                    "bounding_boxes": label_info.get("bounding_boxes", [])
                })

        return file_data
    
    async def _analysis_data(
        self, 
        upload_request: UploadRequest, 
        model_name: str, 
        task: str, 
        file_data: Dict[str, List[Dict[str, str]]], 
        user_id: int, 
        department_id: int
    ):
        if task == "cls":
            url = f"http://{os.getenv('REDIS_HOST')}:8001/dl/api/cls"
        else:
            url = f"http://{os.getenv('REDIS_HOST')}:8001/dl/api/det"


        if department_id:
            department = self.db.query(Departments).filter(Departments.department_id == department_id).first()
            department_name = department.department_name if department else "None"
        else:
            department_name = "None"

        data = {
            "image_data": file_data["labels"],
            "model_name": model_name,
            "department_name": department_name,
            "user_id": user_id,
            "project_id": upload_request.project_id,
            "is_private": upload_request.is_private
        }

        headers = {"Content-Type": "application/json"}
        try:
            session = requests.Session()
            retry = Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
            adapter = HTTPAdapter(max_retries=retry)
            session.mount('http://', adapter)
            session.mount('https://', adapter)
            result = session.post(url, json = data, headers=headers)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred: {str(e)}"
            )
        
    async def _after_save_upload_batch(self, inserted_id: str):
        try:
            await self.collection_upload_batches.update_one(
                {"_id": ObjectId(inserted_id)},  # ID로 문서 찾기
                {
                    "$set": {
                        "isDone": True,  # 작업 완료 표시
                        "updatedAt": datetime.now()  # 수정 시간 업데이트
                    }
                }
            )
        except Exception as e:
            raise Exception(f"Failed to update results: {str(e)}")
        
    async def _mapping_user_upload_batches(self, project_id: str, user_id: int, upload_batch_id: str):
        try:
            # 기존 document 확인
            existing_doc = await self.collection_user_upload_batches.find_one()

            # 문서가 없을 경우 새로운 문서 생성
            if existing_doc is None:
                new_document = {
                    "project": {}
                }
                await self.collection_user_upload_batches.insert_one(new_document)
                existing_doc = new_document

            # project_id와 user_id에 해당하는 배열이 있는지 확인
            project_data = existing_doc.get("project", {})
            user_data = project_data.get(str(project_id), {})
            current_batches = user_data.get(str(user_id), [])

            # 새로운 batch_id를 추가하고 중복 제거
            updated_batches = list(set(current_batches + [upload_batch_id]))

            # 업데이트 수행
            await self.collection_user_upload_batches.update_one(
                {},
                {
                    "$set": {
                        f"project.{str(project_id)}.{str(user_id)}": updated_batches
                    }
                }
            )
        except Exception as e:
            raise Exception(f"Failed to update histories: {str(e)}")
        
    async def get_upload_batch(self, user_id: int, project_id: str, page: int, limit: int):
        try:
            user_upload_batches_doc = await self.collection_user_upload_batches.find_one({})
            if not user_upload_batches_doc or 'project' not in user_upload_batches_doc:
                return {
                    "data": [UploadBatchListData()],
                    "page": page,
                    "limit": limit,
                    "total_count": 0,
                    "total_pages": 0
                }
                
            project_data = user_upload_batches_doc['project'].get(project_id, {})
            if not project_data:
                return {
                    "data": [UploadBatchListData()],
                    "page": page,
                    "limit": limit,
                    "total_count": 0,
                    "total_pages": 0
                }
            
            batch_ids = project_data.get(str(user_id), [])
            if not batch_ids:
                return {
                    "data": [UploadBatchListData()],
                    "page": page,
                    "limit": limit,
                    "total_count": 0,
                    "total_pages": 0
                }

            total_batches = len(batch_ids)
            total_pages = (total_batches + limit - 1) // limit

            # 전체 batch_ids를 ObjectId로 변환
            object_ids = [ObjectId(bid) for bid in batch_ids]

            # MongoDB의 정렬과 페이지네이션 기능 활용
            batches = await self.collection_upload_batches.find(
                {"_id": {"$in": object_ids}}
            ).sort('createdAt', -1).skip((page - 1) * limit).limit(limit).to_list(length=limit)

            return_value = [
                UploadBatchListData(
                    batch_id=str(batch["_id"]),
                    user_id=batch["userId"],
                    project_id=batch["projectId"],
                    is_done=batch["isDone"],
                    created_at=batch["createdAt"],
                    updated_at=batch["updatedAt"]
                )
                for batch in batches
            ]

            return {
                "data": return_value,
                "page": page,
                "limit": limit,
                "total_count": total_batches,
                "total_pages": total_pages
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))