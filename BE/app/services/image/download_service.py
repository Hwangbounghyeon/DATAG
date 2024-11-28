from bson import ObjectId
from datetime import date
import zipfile
import requests
import io

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from dto.download_dto import DownloadRequest

class DownloadService:
    def __init__(self, db : Session, mongodb: Session):
        self.db = db
        self.collection_metadata = mongodb.get_collection("metadata")
        self.collection_features = mongodb.get_collection("features")
        self.collection_images = mongodb.get_collection("images")

    async def get_metadata(self, metadata_id):
        try:
            metadata = await self.collection_metadata.find_one({"_id": ObjectId(metadata_id)})
            if not metadata:
                raise ValueError(f"Metadata ID {metadata_id}를 찾을 수 없습니다.")
            metadata["_id"] = str(metadata["_id"])
            return metadata
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"메타데이터를 가져오는 중 오류 발생: {str(e)}")
    
    async def get_feature(self, feature_id):
        try:
            feature = await self.collection_features.find_one({"_id": ObjectId(feature_id)})
            if not feature:
                raise ValueError(f"Feature ID {feature_id}를 찾을 수 없습니다.")
            feature["_id"] = str(feature["_id"])
            return feature
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"피처 데이터를 가져오는 중 오류 발생: {str(e)}")
        
        
    async def download_image(self, request: DownloadRequest):
        try:
            image_list = [ObjectId(image_id) for image_id in request.image_list]
            
            # MongoDB에서 이미지 조회
            images = await self.collection_images.find(
                {"_id": {"$in": image_list}}
            ).to_list(length=None)

            if not images:
                raise HTTPException(status_code=404, detail="이미지가 존재하지 않습니다.")
            
            zip_file = io.BytesIO()
            with zipfile.ZipFile(zip_file, mode='w', compression=zipfile.ZIP_DEFLATED) as zf:
                for index, image in enumerate(images):
                    metadata_id = image.get('metadataId')
                    feature_id = image.get('featureId')
                    
                    # MetaData 추출
                    metadata = await self.get_metadata(str(metadata_id))
                    if not metadata or "fileList" not in metadata or not metadata["fileList"]:
                        raise HTTPException(
                            status_code=404, 
                            detail=f"Metadata {metadata_id}를 가져오는 데 실패했습니다."
                        )
                    
                    metadata_name = f"{index}_metadata.json"
                    metadata_json = io.StringIO(str(metadata))
                    zf.writestr(f"metadata/{metadata_name}", metadata_json.getvalue())
                    
                    # 이미지 추출
                    image_url = metadata["fileList"][0]
                    image_name = f"{index}.jpg"
                    
                    response = requests.get(image_url)
                    if response.status_code != 200:
                        raise HTTPException(status_code=404, detail=f"S3에서 이미지 {index}를 가져오는 데 실패했습니다.")
                    
                    zf.writestr(f"images/{image_name}", response.content)
                    
                    feature = await self.get_feature(str(feature_id))
                    
                    if not feature:
                        raise HTTPException(status_code=404, detail=f"Feature {feature_id}를 가져오는 데 실패했습니다.")
                    
                    feature_name = f"{index}_feature.json"
                    feature_json = io.StringIO(str(feature))
                    zf.writestr(f"features/{feature_name}", feature_json.getvalue())
                    
            zip_file.seek(0)
                
            zipfile_name = date.today().isoformat()

            return StreamingResponse(
                zip_file, 
                media_type="application/zip", 
                headers={
                    "Content-Disposition": f"attachment; filename={zipfile_name}.zip"
                }
            )
        except HTTPException as http_exc:
            raise http_exc
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
                    