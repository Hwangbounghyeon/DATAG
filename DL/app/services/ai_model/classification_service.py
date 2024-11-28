from fastapi import HTTPException
import torch
from torchvision import models
from PIL import Image
from io import BytesIO
import time

from dto.ai_model_dto import AIModelRequest, ClassificationPredictionResult
from services.ai_model.preprocess_service import PreprocessService
from services.mongodb.classification_metadata_service import ClassificationMetadataService
from services.mongodb.image_service import ImageService
from sqlalchemy.orm import Session

OXFORDIIITPET_CLASSES = [
    # Cats
    "Abyssinian", "Bengal", "Birman", "Bombay", "British Shorthair", "Egyptian Mau",
    "Maine Coon", "Persian", "Ragdoll", "Russian Blue", "Siamese", "Sphynx",

    # Dogs
    "American Bulldog", "American Pit Bull Terrier", "Basset Hound", "Beagle", "Boxer",
    "Chihuahua", "English Cocker Spaniel", "English Setter", "German Shorthaired Pointer",
    "Great Pyrenees", "Havanese", "Japanese Chin", "Keeshond", "Leonberger", "Miniature Pinscher",
    "Newfoundland", "Pomeranian", "Pug", "Saint Bernard", "Samoyed", "Scottish Terrier",
    "Shiba Inu", "Staffordshire Bull Terrier", "Wheaten Terrier", "Yorkshire Terrier"
]

class ClassificationService:
    def __init__(self, db: Session):
        self.preprocess_service = PreprocessService()
        self.classification_metadata_service = ClassificationMetadataService()
        self.image_service = ImageService()
        self.model_list = ["efficientnet_v2_s", "convnext_base", "regnet_y_3_2gf"]
        self.features = None
        self.conf_threshold = 0.7

    async def classify_images(self, request: AIModelRequest):
        try:
            # 모델리스트에 없으면 에러
            if request.model_name == "efficientnet_v2_s":
                model = self._set_model_efficientnet_v2_s()
            elif request.model_name == "convnext_base":
                model = self._set_model_convnext_base()
            elif request.model_name == "regnet_y_3_2gf":
                model = self._set_model_regnet_y_3_2gf()
            else:
                raise HTTPException(
                    status_code=400, 
                    detail="Classification Model Not Found"
                )

            for image_entry in request.image_data:
                url = image_entry['url']
                label = image_entry.get('label')
                bounding_boxes = image_entry.get('bounding_boxes', [])
                
                image_data = self.preprocess_service.load_image_from_s3(url)
                image_data = Image.open(BytesIO(image_data))
                image_tensor = self.preprocess_service.process_image(image_data, (32, 32), use_normalize=True)

                model_prediction_result = self._predict_model_CNN(model, request.model_name, image_tensor)

                if model_prediction_result is None:
                    continue

                metadata, tags = self.classification_metadata_service.create_classification_result_data(
                    request.user_id,
                    request.project_id,
                    request.is_private,
                    model_prediction_result.used_model,
                    model_prediction_result.predict_class,
                    model_prediction_result.predict_confidence,
                    model_prediction_result.elapsed_time,
                    url,
                    request.department_name
                )

                metadata_id = await self.classification_metadata_service.upload_ai_result(metadata)

                features = self.classification_metadata_service.create_feature(model_prediction_result.features)

                features_id = await self.classification_metadata_service.upload_feature(features)

                if label:
                    label_id = await self.classification_metadata_service.upload_label_data(label, bounding_boxes)
                else:
                    label_id = None

                image_id = await self.image_service.save_images_mongodb(metadata_id, features_id, label_id)

                await self.image_service.mapping_image_model_mongodb(image_id, request.model_name)

                for tag in tags:
                    await self.classification_metadata_service.mapping_image_tags_mongodb(tag, image_id)

                await self.image_service.mapping_project_images_mongodb(request.project_id, image_id)

                await self.image_service.mapping_image_permissions_mongodb(request.user_id, request.department_name, request.project_id, image_id)

        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Detection failed: {str(e)}"
            )

    # 모델 정의(EfficientNetV2)
    def _set_model_efficientnet_v2_s(self) -> torch.nn.Module:
        model = models.efficientnet_v2_s(weights =models.EfficientNet_V2_S_Weights.DEFAULT)
        model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 37)
        model_path = "best_pet_EfficientNetV2.pth"
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        weigth = torch.load(model_path, map_location=torch.device(device))
        model.load_state_dict(weigth)
        model.verbose = False

        def hook_fn(module, input, output):
            self.features = output
            
        model.features[-1].register_forward_hook(hook_fn)
        return model

    # 모델 정의(ConvNeXt)
    def _set_model_convnext_base(self) -> torch.nn.Module:
        model = models.convnext_base(weights =models.ConvNeXt_Base_Weights.DEFAULT)
        model.classifier = torch.nn.Sequential(
            model.classifier[0], 
            model.classifier[1], 
            torch.nn.Linear(model.classifier[2].in_features, 37) 
        )
        model_path = "best_pet_ConvNeXt.pth"
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        weight = torch.load(model_path, map_location=torch.device(device))
        model.load_state_dict(weight)
        model.verbose = False

        def hook_fn(module, input, output):
            self.features = output

        model.features[-1].register_forward_hook(hook_fn)
        return model

    # 모델 정의(RegNet)
    def _set_model_regnet_y_3_2gf(self) -> torch.nn.Module:
        model = models.regnet_y_3_2gf(weights =models.RegNet_Y_3_2GF_Weights.DEFAULT)
        num_ftrs = model.fc.in_features
        model.fc = torch.nn.Linear(num_ftrs, 37)
        model_path = "best_pet_RegNet.pth"
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        weight = torch.load(model_path, map_location=torch.device(device))
        model.load_state_dict(weight)
        model.verbose = False

        def hook_fn(module, input, output):
            self.features = output

        model.avgpool.register_forward_hook(hook_fn)
        return model

    # 모델 예측
    def _predict_model_CNN(self, model: torch.nn.Module, model_name: str, image_tensor: torch.Tensor) -> ClassificationPredictionResult:
        try:
            # features 초기화
            self.features = None
            # 시작 시간
            start_time = time.time()

            model.eval()

            with torch.no_grad():
                output = model(image_tensor)
                # 가장 높은 확률값과 해당 클래스 인덱스 추출
                conf, predicted_class = torch.max(output, dim=1)

            # 종료 시간
            end_time = time.time()
            # 실행 시간 계산
            elapsed_time = end_time - start_time

            model_results = {
                "used_model": model_name,
                "predict_class": OXFORDIIITPET_CLASSES[int(predicted_class.item())],
                "predict_confidence": float(conf.item()) * 0.1,
                "features": self.features.view(self.features.size(0), -1).tolist(),
                "elapsed_time": elapsed_time
            }
            return ClassificationPredictionResult(**model_results)

        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Detection failed: {str(e)}"
            )