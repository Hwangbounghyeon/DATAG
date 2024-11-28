from fastapi import HTTPException
from typing import List
from sklearn.manifold import TSNE
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from bson import ObjectId
import numpy as np
import umap

from utils.timezone import get_current_time
from dto.search_dto import SearchCondition
from dto.analysis_dto import DimensionReductionRequest, AutoDimensionReductionRequest, DimensionReductionResponse
from models.history_models import HistoryData, ReductionResults

class AnalysisService:
    def __init__(self, db: Session, mongodb: Session):
        self.db = db
        self.collection_histories = mongodb.get_collection("histories")
        self.collection_features = mongodb.get_collection("features")
        self.collection_project_histories = mongodb.get_collection("projectHistories")
        self.collection_images = mongodb.get_collection("images")
        self.collection_metadata = mongodb.get_collection("metadata")
        self.collection_labels = mongodb.get_collection("imageLabels")
        self.collection_tag_images = mongodb.get_collection("tagImages")
        self.collection_project_images = mongodb.get_collection("projectImages")

    # 수동 차원축소
    async def dimension_reduction(self, request: DimensionReductionRequest, user_id: int) -> DimensionReductionResponse:
        # mongodb 저장
        inserted_id = None
        try:
            inserted_id = await self._save_history_mongodb(
                user_id,
                request.project_id,
                request.is_private,
                request.history_name,
                request.algorithm,
                request.selected_tags,
            )

            if len(request.image_ids) < 10:
                raise Exception(f"Dimension reduction failed")

            await self._mapping_project_histories_mongodb(request.project_id, inserted_id)

            # image_ids로 이미지 정보들 가져오기
            image_features = await self._get_image_features(request.image_ids)

            concat_image_infos = []
            for i in range(len(image_features)):
                image_info = await self.collection_images.find_one({"_id": ObjectId(request.image_ids[i])})
                image_metadata = await self.collection_metadata.find_one({"_id": ObjectId(image_info.get("metadataId"))})
                label_info = await self.collection_labels.find_one({"_id": ObjectId(image_info.get("labelId"))}) if image_info.get("labelId") else None

                ai_results = image_metadata["aiResults"][0]
                predictions = ai_results["predictions"][0]

                # feature의 클래스 수만큼 반복
                if ai_results["task"] == "det":
                    used_labels = set()
                    
                    # Ground Truth (label_info)와 Predictions 매핑
                    if label_info:
                        detail_count = 0
                        for pred_idx, prediction in enumerate(predictions["detections"]):
                            max_iou = 0
                            best_match_idx = None

                            # 각 label bounding box에 대해 predictions와의 IoU 계산
                            for label_idx, label_box in enumerate(label_info["bounding_boxes"]):
                                current_iou = self._iou(prediction["bbox"], label_box)
                                if current_iou > max_iou:
                                    max_iou = current_iou
                                    best_match_idx = label_idx

                            # 매핑 기준에 따른 처리
                            if max_iou >= 0.6 and best_match_idx is not None:
                                used_labels.add(best_match_idx)
                                
                                best_bbox = label_info["bounding_boxes"][best_match_idx]
                                label_dict = {
                                    "label": label_info['label'][best_match_idx],
                                    "bbox": [best_bbox["x_min"],best_bbox["y_min"],best_bbox["x_max"],best_bbox["y_max"]]
                                }
                                
                                concat_image_infos.append({
                                    "imageId": request.image_ids[i],
                                    "detailId": request.image_ids[i] + "_" + str(detail_count),
                                    "predictions": prediction,
                                    "label": label_dict,  # label 가져오기
                                    "iou": max_iou,
                                    "imageUrl": image_metadata["fileList"][0],
                                })
                            else:
                                # IoU가 기준보다 낮은 경우
                                concat_image_infos.append({
                                    "imageId": request.image_ids[i],
                                    "detailId": request.image_ids[i] + "_" + str(detail_count),
                                    "predictions": prediction,
                                    "label": None,
                                    "iou": None,
                                    "imageUrl": image_metadata["fileList"][0],
                                })  
                            detail_count += 1
                        
                        # 남은 label 처리
                        for label_idx, label_box in enumerate(label_info["bounding_boxes"]):
                            if label_idx not in used_labels:
                                remain_bbox = label_info["bounding_boxes"][label_idx]
                                label_dict = {
                                    "label": label_info['label'][label_idx],
                                    "bbox": [remain_bbox["x_min"],remain_bbox["y_min"],remain_bbox["x_max"],remain_bbox["y_max"]]
                                }
                                
                                concat_image_infos.append({
                                    "imageId": request.image_ids[i],
                                    "detailId": request.image_ids[i] + "_" + str(detail_count),
                                    "predictions": None,
                                    "label": label_dict,
                                    "iou": None,
                                    "imageUrl": image_metadata["fileList"][0],
                                })
                                detail_count += 1
                    else:
                        detail_count = 0
                        for pred_idx, prediction in enumerate(predictions["detections"]):
                            concat_image_infos.append({
                                "imageId": request.image_ids[i],
                                "detailId": request.image_ids[i] + "_" + str(detail_count),
                                "predictions": prediction,
                                "label": None,
                                "iou": None,
                                "imageUrl": image_metadata["fileList"][0],
                            })
                            detail_count += 1
                else:
                    concat_image_infos.append({
                        "imageId": request.image_ids[i],
                        "detailId": request.image_ids[i] + "_0",
                        "predictions": {
                            "prediction": predictions["prediction"],
                            "confidence": predictions["confidence"]
                        },
                        "label": label_info["label"][0] if label_info else None,
                        "imageUrl": image_metadata["fileList"][0]
                    })
            
            # features concatenate
            concat_features = self._concatenate_array(image_features)
            
            # 차원축소 진행
            if request.algorithm == "tsne":
                reduction_features = self._dimension_reduction_TSNE(concat_features)
            else:
                reduction_features = self._dimension_reduction_UMAP(concat_features)

            feature_idx = 0
            for i in range(len(concat_image_infos)):
                if concat_image_infos[i]["predictions"] is not None:
                    concat_image_infos[i]["features"] = reduction_features[feature_idx]
                    feature_idx += 1
                else:
                    concat_image_infos[i]["features"] = None

            # 작업 완료
            await self._save_history_completed_mongodb(inserted_id, concat_image_infos)

            return DimensionReductionResponse(
                history_id=inserted_id,
                project_id=request.project_id,
                user_id=user_id,
                history_name=request.history_name
            )
        except Exception as e:
            if inserted_id:
                await self._save_history_failed_mongodb(inserted_id)
            raise Exception(f"Dimension reduction failed: {str(e)}")


    # 자동 차원축소 
    async def auto_dimension_reduction(self, request: AutoDimensionReductionRequest, user_id: int) -> DimensionReductionResponse:
        inserted_id = None
        try:
            inserted_id = await self._save_history_mongodb(
                user_id,
                request.project_id,
                request.is_private,
                request.history_name,
                request.algorithm,
                request.selected_tags,
            )

            await self._mapping_project_histories_mongodb(request.project_id, inserted_id)
            
            project_images = await self.collection_project_images.find_one({})
            if not project_images or "project" not in project_images:
                raise Exception(f"Dimension reduction failed")

            project_image_ids = set(project_images["project"].get(request.project_id, []))
            if not project_image_ids:
                raise Exception(f"Dimension reduction failed")
            
            if not request.selected_tags:
                final_matching_ids = project_image_ids
            else:
                final_matching_ids = set()
                for condition in request.selected_tags:
                    group_result = await self._get_filtered_image_ids(condition)
                    final_matching_ids.update(group_result)

                if not final_matching_ids:
                    raise Exception(f"Dimension reduction failed")
                
                final_matching_ids &= project_image_ids
            
            final_matching_ids = list(final_matching_ids)
            
            if len(final_matching_ids) < 10:
                raise Exception(f"Dimension reduction failed")

            # image_ids로 이미지 정보들 가져오기
            image_features = await self._get_image_features(final_matching_ids)

            concat_image_infos = []
            for i in range(len(image_features)):
                image_info = await self.collection_images.find_one({"_id": ObjectId(final_matching_ids[i])})
                image_metadata = await self.collection_metadata.find_one({"_id": ObjectId(image_info.get("metadataId"))})
                label_info = await self.collection_labels.find_one({"_id": ObjectId(image_info.get("labelId"))}) if image_info.get("labelId") else None

                ai_results = image_metadata["aiResults"][0]
                predictions = ai_results["predictions"][0]

                # feature의 클래스 수만큼 반복
                if ai_results["task"] == "det":
                    used_labels = set()
                    
                    # Ground Truth (label_info)와 Predictions 매핑
                    if label_info:
                        detail_count = 0
                        for pred_idx, prediction in enumerate(predictions["detections"]):
                            max_iou = 0
                            best_match_idx = None

                            # 각 label bounding box에 대해 predictions와의 IoU 계산
                            for label_idx, label_box in enumerate(label_info["bounding_boxes"]):
                                current_iou = self._iou(prediction["bbox"], label_box)
                                if current_iou > max_iou:
                                    max_iou = current_iou
                                    best_match_idx = label_idx

                            # 매핑 기준에 따른 처리
                            if max_iou >= 0.6 and best_match_idx is not None:
                                used_labels.add(best_match_idx)
                                
                                best_bbox = label_info["bounding_boxes"][best_match_idx]
                                label_dict = {
                                    "label": label_info['label'][best_match_idx],
                                    "bbox": [best_bbox["x_min"],best_bbox["y_min"],best_bbox["x_max"],best_bbox["y_max"]]
                                }
                                
                                concat_image_infos.append({
                                    "imageId": final_matching_ids[i],
                                    "detailId": final_matching_ids[i] + "_" + str(detail_count),
                                    "predictions": prediction,
                                    "label": label_dict,  # label 가져오기
                                    "iou": max_iou,
                                    "imageUrl": image_metadata["fileList"][0],
                                })
                            else:
                                # IoU가 기준보다 낮은 경우
                                concat_image_infos.append({
                                    "imageId": final_matching_ids[i],
                                    "detailId": final_matching_ids[i] + "_" + str(detail_count),
                                    "predictions": prediction,
                                    "label": None,
                                    "iou": None,
                                    "imageUrl": image_metadata["fileList"][0],
                                })
                            detail_count += 1
                        
                        # 남은 label 처리
                        for label_idx, label_box in enumerate(label_info["bounding_boxes"]):
                            if label_idx not in used_labels:
                                remain_bbox = label_info["bounding_boxes"][label_idx]
                                label_dict = {
                                    "label": label_info['label'][label_idx],
                                    "bbox": [remain_bbox["x_min"],remain_bbox["y_min"],remain_bbox["x_max"],remain_bbox["y_max"]]
                                }
                                
                                concat_image_infos.append({
                                    "imageId": final_matching_ids[i],
                                    "detailId": final_matching_ids[i] + "_" + str(detail_count),
                                    "predictions": None,
                                    "label": label_dict,
                                    "iou": None,
                                    "imageUrl": image_metadata["fileList"][0],
                                })
                                detail_count += 1
                    else:
                        detail_count = 0
                        for pred_idx, prediction in enumerate(predictions["detections"]):
                            concat_image_infos.append({
                                "imageId": final_matching_ids[i],
                                "detailId": final_matching_ids[i] + "_" + str(detail_count),
                                "predictions": prediction,
                                "label": None,
                                "iou": None,
                                "imageUrl": image_metadata["fileList"][0],
                            })
                            detail_count += 1
                else:
                    concat_image_infos.append({
                        "imageId": final_matching_ids[i],
                        "detailId": final_matching_ids[i] + "_0",
                        "predictions": {
                            "prediction": predictions["prediction"],
                            "confidence": predictions["confidence"]
                        },
                        "label": label_info["label"][0] if label_info else None,
                        "imageUrl": image_metadata["fileList"][0]
                    })
                        
            # features concatenate
            concat_features = self._concatenate_array(image_features)
            
            # 차원축소 진행
            if request.algorithm == "tsne":
                reduction_features = self._dimension_reduction_TSNE(concat_features)
            else:
                reduction_features = self._dimension_reduction_UMAP(concat_features)

            feature_idx = 0
            for i in range(len(concat_image_infos)):
                if concat_image_infos[i]["predictions"] is not None:
                    concat_image_infos[i]["features"] = reduction_features[feature_idx]
                    feature_idx += 1
                else:
                    concat_image_infos[i]["features"] = None

            # 작업 완료
            await self._save_history_completed_mongodb(inserted_id, concat_image_infos)

            return DimensionReductionResponse(
                history_id=inserted_id,
                project_id=request.project_id,
                user_id=user_id,
                history_name=request.history_name
            )
        except Exception as e:
            if inserted_id:
                await self._save_history_failed_mongodb(inserted_id)
            raise Exception(f"Dimension reduction failed: {str(e)}")

    # image id 필터링해서 가져오기
    async def _get_filtered_image_ids(self, condition: SearchCondition) -> set:
        result_ids = None

        tag_doc = await self.collection_tag_images.find_one({})
        if not tag_doc:
            raise Exception(f"Can't find tag document")

        # AND 조건 처리
        if condition.and_condition:
            for tag in condition.and_condition:
                if tag in tag_doc['tag']:
                    current_ids = set(tag_doc['tag'][tag])
                    result_ids = current_ids if result_ids is None else result_ids & current_ids
                else:
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

    # feature 가져오기
    async def _get_image_features(self, image_ids: List[str]) -> List[List[float]]:
        # IN 절을 사용하여 한 번의 쿼리로 모든 이미지 정보 조회
        images = await self.collection_images.find(
            {"_id": {"$in": [ObjectId(id) for id in image_ids]}}
        ).to_list(length=None)

        if not images:
            raise HTTPException(
                status_code=404,
                detail="No images found with the provided IDs"
            )
        
        # image_ids의 순서를 유지하기 위한 딕셔너리 생성
        image_dict = {str(image["_id"]): image["featureId"] for image in images}
        features = []

        # MongoDB에서 feature 데이터 조회
        for image_id in image_ids:
            if image_id in image_dict:
                feature_id = image_dict[image_id]
                feature_doc = await self.collection_features.find_one(
                    {"_id": ObjectId(feature_id)}
                )
                if feature_doc and "feature" in feature_doc:
                    features.append(feature_doc["feature"])

        return features

    # TSNE 차원축소
    def _dimension_reduction_TSNE(
        self, 
        features: np.ndarray,
        n_components: int = 10,
        perplexity: int = 50
    ) -> List[List[float]]:
        # 최대 50 제한
        perplexity = min(int(np.sqrt(features.shape[0])), perplexity)

        tsne = TSNE(n_components=n_components, verbose=1, perplexity=perplexity, method="exact")

        tsne_result = tsne.fit_transform(features)
        return tsne_result.tolist()

    # umap 차원축소
    def _dimension_reduction_UMAP(
        self,
        features: np.ndarray,
        n_components: int = 10,
        n_neighbors: int = 10
    ) -> List[List[float]]:
        n_neighbors_min = min(n_neighbors, features.shape[0]-1)
        
        umap_reducer = umap.UMAP(
            n_components=n_components, 
            n_neighbors=n_neighbors_min, 
            init='random',
            n_jobs=1
        )

        umap_result = umap_reducer.fit_transform(features)
        return umap_result.tolist()

    # array concatenate
    def _concatenate_array(self, features: List[List[float]]) -> np.ndarray:
        return np.concatenate(features, axis=0)
        
    # mongodb history object 생성
    def _create_history_mongodb(
        self,
        userId: int,
        projectId: str,
        is_private: bool,
        history_name: str,
        selected_algorithm: str,
        selected_tags: List[SearchCondition],
    ) -> HistoryData:

        # 필수 파라미터가 누락되었는지 확인
        required_params = {
            "userId": userId,
            "projectId": projectId,
            "selected_algorithm": selected_algorithm,
            "selected_tags": selected_tags,
            "is_private": is_private,
            "history_name": history_name
        }

        missing_params = [k for k, v in required_params.items() if v is None]
        if missing_params:
            raise ValueError(f"Missing required parameters: {', '.join(missing_params)}")

        history_obj = {
            "userId": userId,
            "projectId": projectId,
            "isPrivate": is_private,
            "historyName": history_name,
            "isDone": 0,
            "parameters": {
                "selectedAlgorithm": selected_algorithm,
                "selectedTags": selected_tags
            },
            "results": None,
            "createdAt": get_current_time(),
            "updatedAt": get_current_time()
        }   
        
        return HistoryData.model_validate(history_obj)
    
    # 차원축소 기록 저장 (mongodb)
    async def _save_history_mongodb(
        self,
        userId: int,
        projectId: str,
        is_private: bool,
        history_name: str,
        selected_algorithm: str,
        selected_tags: List[SearchCondition],
    ):
        try:
            history_obj = self._create_history_mongodb(
                userId,
                projectId,
                is_private,
                history_name,
                selected_algorithm, 
                selected_tags
            )
            result = await self.collection_histories.insert_one(history_obj.model_dump())

            if result.inserted_id:
                return str(result.inserted_id)
            else:
                raise HTTPException(status_code=500, detail="Failed to save cls metadata")
        except Exception as e:
            raise Exception(f"Failed to update results: {str(e)}")


    # 차원축소 기록 완료 저장 (mongodb)
    async def _save_history_completed_mongodb(
        self,
        history_id: str,
        image_infos: List[ReductionResults]
    ):
        try:
            document = await self.collection_histories.find_one({"_id": ObjectId(history_id)})
            if not document:
                raise Exception(f"Document with id {history_id} not found")
            
            update_data = {
                "results": image_infos,
                "isDone": 1,
                "updatedAt": datetime.now(timezone.utc)
            }

            await self.collection_histories.update_one(
                {"_id": ObjectId(history_id)},  # ID로 문서 찾기
                {"$set": update_data}
            )
        except Exception as e:
            raise Exception(f"Failed to update results: {str(e)}")

    async def _save_history_failed_mongodb(
        self,
        history_id: str
    ):
        try:
            document = await self.collection_histories.find_one({"_id": ObjectId(history_id)})
            if not document:
                raise Exception(f"Document with id {history_id} not found")
            
            update_data = {
                "isDone": 2,
                "updatedAt": datetime.now(timezone.utc)
            }

            await self.collection_histories.update_one(
                {"_id": ObjectId(history_id)},  # ID로 문서 찾기
                {"$set": update_data}
            )
        except Exception as e:
            raise Exception(f"Failed to update results: {str(e)}")

    async def _mapping_project_histories_mongodb(self, project_id: str, history_id: str):
        try:
            # 기존 document 확인
            existing_doc = await self.collection_project_histories.find_one()

            # 문서가 없을 경우 새로운 문서 생성
            if existing_doc is None:
                new_document = {
                    "project": {}
                }
                await self.collection_project_histories.insert_one(new_document)

            # 업데이트 수행
            await self.collection_project_histories.update_one(
                {},
                {
                    "$addToSet": {
                        f"project.{str(project_id)}": history_id
                    }
                }
            )
        except Exception as e:
            raise Exception(f"Failed to update results: {str(e)}")
        

    # IOU 계산
    def _iou(self, box1, box2):
        try:
            box2 = [box2["x_min"],box2["y_min"],box2["x_max"],box2["y_max"]]
            box1_area = (box1[2] - box1[0] + 1) * (box1[3] - box1[1] + 1)
            box2_area = (box2[2] - box2[0] + 1) * (box2[3] - box2[1] + 1)

            x1 = max(box1[0], box2[0])
            y1 = max(box1[1], box2[1])
            x2 = min(box1[2], box2[2])
            y2 = min(box1[3], box2[3])

            w = max(0, x2 - x1 + 1)
            h = max(0, y2 - y1 + 1)

            inter = w * h
            iou = inter / (box1_area + box2_area - inter)
            return iou
        except Exception as e:
            raise Exception(f"Failed to IOU: {str(e)}")
