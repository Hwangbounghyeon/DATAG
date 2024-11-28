from fastapi import HTTPException
from typing import List
import torch
from torchvision import transforms
from PIL import Image
from PIL.Image import Image as PILImage
import requests

class PreprocessService:
    def __init__(self):
        pass

    def load_image_from_s3(self, url: str) -> bytes:
        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.content
            
        except requests.RequestException as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to download image from {url}: {str(e)}"
            )

    def process_image(self, image_data: PILImage, target_size: tuple, use_normalize: bool = False) -> torch.Tensor:
        try:
            image = image_data.convert('RGB')
            
            if use_normalize:
                preprocess = transforms.Compose([
                    transforms.Resize(target_size),
                    transforms.ToTensor(),
                    transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225)),
                ])
            else:
                preprocess = transforms.Compose([
                    transforms.Resize(target_size),
                    transforms.ToTensor()
                ])
            
            input_data = preprocess(image)
            return input_data.unsqueeze(0)

        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to process image: {str(e)}"
            )