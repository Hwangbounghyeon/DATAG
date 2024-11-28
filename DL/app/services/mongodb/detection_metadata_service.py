from fastapi import HTTPException
from typing import List, Dict
from configs.mongodb import collection_metadata, collection_features, collection_tag_images, collection_labels
from models.feature_models import Feature
from models.detection_models import AiResultData
from datetime import datetime, timezone
import random

BRANCHES = ["Seoul", "Gumi", "Daejeon", "Gwangju", "Busan"]
LOCATIONS = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E"]
EQUIPMENT_IDS = ["EdgeDevice01", "EdgeDevice02", "EdgeDevice03", "EdgeDevice04", "EdgeDevice05"]
DEPARTMENTS = ["Research and Development", "Production Management", "Production Technology", "Computer", "Quality Control"]

class ObjectDetectionMetadataService:
    def __init__(self):
        pass

    # Object Detection JSON형식 생성
    def create_object_detection_result_data(
        self,
        user: int,
        project_id: str,
        is_private: bool,
        ai_model: str,
        elapsed_time: float,
        predictions: List[str],
        confidences: List[float],
        threshold: float,
        bboxes: List[List[float]],
        url: str,
        department_name: str
    ) -> AiResultData:
        
        # 필수 파라미터가 누락되었는지 확인
        required_params = {
            "user": user,
            "is_private": is_private,
            "ai_model": ai_model,
            "elapsed_time": elapsed_time,
            "project_id": project_id,
            "predictions": predictions,
            "confidences": confidences,
            "threshold": threshold,
            "bboxes": bboxes,
            "image_url": url
        }

        missing_params = [k for k, v in required_params.items() if v is None]
        if missing_params:
            raise ValueError(f"Missing required parameters: {', '.join(missing_params)}")
        
        departments = [department_name] if department_name != "" or not is_private else []
        
        branch = random.choice(BRANCHES)
        location = random.choice(LOCATIONS)
        equipmentId = random.choice(EQUIPMENT_IDS)

        prediction_tags = []
        for each_tag in predictions:
            if each_tag not in prediction_tags:
                prediction_tags.append(each_tag)
        
        tags = [
            ai_model,
            "Object Detection",
            str(datetime.now().year) + "_" + str(datetime.now().month),
            branch,
            location,
            equipmentId
        ] + prediction_tags

        ai_result_data = {
            "schemaVersion": "1.0",
            "fileList": [url],
            "metadata": {
                "branch": branch,
                "process": "Manufacturing",
                "location": location,
                "equipmentId": equipmentId,
                "uploader": user,
                "isPrivate": is_private,
                "accessControl": {
                    "users": [user],
                    "departments": departments,
                    "projects": [str(project_id)]
                },
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "mode": "upload"
            },
            "aiResults": [
                {
                    "aiModel": ai_model,
                    "task": "det",
                    "predictions": [
                        {
                            "fileIndex": 0,
                            "detections": [
                                {
                                    "prediction": predictions[i],
                                    "confidence": confidences[i],
                                    "threshold": threshold,
                                    "bbox": bboxes[i]
                                } for i in range(len(predictions))
                            ],
                            "inferenceStartedAt": datetime.now(timezone.utc).isoformat(),
                            "elapsedTime": elapsed_time,
                            "tags": [
                                ai_model,
                                "Object Detection",
                                str(datetime.now().year) + "_" + str(datetime.now().month),
                                branch,
                                location,
                                equipmentId
                            ] + prediction_tags
                        }
                    ]
                }
            ]
        }

        return AiResultData.model_validate(ai_result_data), tags

    # MongoDB 업로드
    async def upload_ai_result(self, ai_result_data: AiResultData):
        ai_result_dict = ai_result_data.dict() 
        result = await collection_metadata.insert_one(ai_result_dict)
        if result.inserted_id:
            return str(result.inserted_id)
        else:
            raise HTTPException(status_code=500, detail="Failed to save det metadata")

    # Feature JSON형식 생성
    def create_feature(self, feature: List[List[float]]) -> Feature:
        data = {
            "feature" : feature,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        
        return Feature.model_validate(data)

    # MongoDB 업로드
    async def upload_feature(self, feature: Feature):
        feature_dict = feature.dict() 
        result = await collection_features.insert_one(feature_dict)
        if result.inserted_id:
            return str(result.inserted_id)
        else:
            raise HTTPException(status_code=500, detail="Failed to save Feature")

    async def mapping_image_tags_mongodb(self, tag_name: str, image_id: str):
        try:
            existing_doc = await collection_tag_images.find_one()

            # 문서가 없을 경우 새로운 문서 생성
            if existing_doc is None:
                new_document = {
                    "tag": {}
                }
                await collection_tag_images.insert_one(new_document)
                existing_doc = new_document

            current_images = existing_doc.get("tag", {}).get(str(tag_name))

            if current_images is None:
                current_images = []

            updated_images = list(set(current_images + [image_id]))

            await collection_tag_images.update_one(
                {},
                {
                    "$set": {
                        f"tag.{str(tag_name)}": updated_images
                    }
                }
            )
        except Exception as e:
            raise Exception(f"Failed to update results: {str(e)}")
        
    async def upload_label_data(self, label: List, bounding_boxes: List[Dict[str, int]]):
        try:
            label_document = {
                "label": label,
                "bounding_boxes": bounding_boxes,
                "createdAt": datetime.now(timezone.utc).isoformat()
            }
            result = await collection_labels.insert_one(label_document)
            if result.inserted_id:
                return str(result.inserted_id)
            else:
                raise HTTPException(status_code=500, detail="Failed to save label data.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Label data upload failed: {str(e)}")