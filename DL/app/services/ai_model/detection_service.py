from fastapi import HTTPException
from typing import List
from ultralytics import YOLO
import torch
from PIL import Image
from PIL.Image import Image as PILImage
from io import BytesIO
import numpy as np
import torch.nn as nn
import time

from dto.ai_model_dto import AIModelRequest, ObjectDetectionPredictionResult
from services.ai_model.preprocess_service import PreprocessService
from services.mongodb.detection_metadata_service import ObjectDetectionMetadataService
from services.mongodb.image_service import ImageService
from sqlalchemy.orm import Session

YOLOMODEL = type[YOLO]

class ObjectDetectionService:
    def __init__(self, db: Session):
        self.preprocess_service = PreprocessService()
        self.detection_metadata_service = ObjectDetectionMetadataService()
        self.image_service = ImageService()
        self.model_list = ["yolov5n", "yolov8n", "yolo11n"]
        self.features = None
        self.conf_threshold = 0.7

    # 객체 탐지 실행 (나중에 반환타입 명시하기)
    async def detect_images(self, request: AIModelRequest):
        try:
            # 모델리스트에 없으면 에러
            if request.model_name not in self.model_list:
                raise HTTPException(
                    status_code=400, 
                    detail="Detection Model Not Found"
                )

            model = self._set_model_YOLO(request.model_name)

            for image_entry in request.image_data:
                url = image_entry['url']
                label = image_entry.get('label')
                bounding_boxes = image_entry.get('bounding_boxes', [])

                image_data = self.preprocess_service.load_image_from_s3(url)
                image_data = Image.open(BytesIO(image_data))
                org_width, org_height = image_data.size

                image_tensor = self.preprocess_service.process_image(image_data, (640, 640))

                model_prediction_result = self._predict_model_YOLO(model, request.model_name, image_tensor, org_width, org_height)

                if model_prediction_result is None:
                    continue

                metadata, tags = self.detection_metadata_service.create_object_detection_result_data(
                    request.user_id,
                    request.project_id,
                    request.is_private,
                    model_prediction_result.used_model,
                    model_prediction_result.elapsed_time,
                    model_prediction_result.predict_classes,
                    model_prediction_result.predict_confidences,
                    model_prediction_result.threshold,
                    model_prediction_result.bboxes,
                    url,
                    request.department_name
                )

                metadata_id = await self.detection_metadata_service.upload_ai_result(metadata)

                features = self.detection_metadata_service.create_feature(model_prediction_result.features)

                features_id = await self.detection_metadata_service.upload_feature(features)

                if label:
                    label_id = await self.detection_metadata_service.upload_label_data(label, bounding_boxes)
                else:
                    label_id = None

                image_id = await self.image_service.save_images_mongodb(metadata_id, features_id, label_id)
                
                await self.image_service.mapping_image_model_mongodb(image_id, request.model_name)

                for tag in tags:
                    await self.detection_metadata_service.mapping_image_tags_mongodb(tag, image_id)

                await self.image_service.mapping_project_images_mongodb(request.project_id, image_id)

                await self.image_service.mapping_image_permissions_mongodb(request.user_id, request.department_name, request.project_id, image_id)

        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Detection failed: {str(e)}"
            )

    # 모델 정의
    def _set_model_YOLO(self, model_name: str) -> YOLOMODEL:
        model = YOLO(f"{model_name}.pt")
        model.verbose = False

        def hook_fn(module, input, output):
            self.features = output

        model.model.model[-2].register_forward_hook(hook_fn)
        return model

    # 모델 예측
    def _predict_model_YOLO(self, model: YOLOMODEL, model_name: str, image_tensor: torch.Tensor, orig_img_width: int, orig_img_height: int) -> ObjectDetectionPredictionResult:
        labels = []
        confidences = []
        features = []
        bboxes = []
        try:
            # 시작 시간
            start_time = time.time()

            results = model(image_tensor, conf=self.conf_threshold, verbose=False)

            if isinstance(results, list):
                results = results[0]

            boxes = results.boxes
            orig_img = results.orig_img

            class_names = results.names

            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

                cls = int(box.cls)
                class_name = class_names[cls] if cls in class_names else f"Class {cls}"
                if class_name not in ["bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe"]:
                    continue

                conf = float(box.conf)
                
                confidences.append(conf)

                cropped_obj = orig_img[y1:y2, x1:x2]

                image_converted = Image.fromarray(cropped_obj)

                input_data = self.preprocess_service.process_image(image_converted, (640, 640))
                
                input_img_width, input_img_height = image_tensor.shape[3], image_tensor.shape[2]
                x1 = int(x1 * (orig_img_width / input_img_width))
                y1 = int(y1 * (orig_img_height / input_img_height))
                x2 = int(x2 * (orig_img_width / input_img_width))
                y2 = int(y2 * (orig_img_height / input_img_height))

                output = model(input_data)
                
                global_avg_pool = nn.AdaptiveAvgPool2d((1, 1))
                output_global = global_avg_pool(self.features)    

                features.append(output_global.view((self.features.size(0), -1)))
                labels.append(class_name)
                bboxes.append([x1, y1, x2, y2])

            # 종료 시간
            end_time = time.time()
            # 실행 시간 계산
            elapsed_time = end_time - start_time

            if len(features) > 0:
                all_features = np.concatenate(features, axis=0)
            else:
                return None

            model_results = {
                "used_model": model_name,
                "threshold": self.conf_threshold,
                "predict_classes": labels,
                "predict_confidences": confidences,
                "bboxes": bboxes,
                "features": all_features.tolist(),
                "elapsed_time": elapsed_time
            }
            return ObjectDetectionPredictionResult(**model_results)

        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Detection failed: {str(e)}"
            )