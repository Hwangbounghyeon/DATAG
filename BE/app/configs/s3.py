from boto3 import client
import io
import os
from dotenv import load_dotenv
from urllib.parse import quote

load_dotenv()

s3_client = client(
    "s3",
    aws_access_key_id = os.getenv("S3_ACCESS_KEY"), 
    aws_secret_access_key = os.getenv('S3_SECRET_ACCESS_KEY'), 
    region_name = os.getenv('S3_REGION_NAME')
)

def upload_to_s3(file: io.BytesIO, bucket_name: str, file_name: str) -> None:
    file.seek(0)
    s3_client.upload_fileobj(
        file,
        bucket_name,
        file_name,
        ExtraArgs={"ContentType": "image/jpeg", "ACL": "public-read"},
    )

BUCKET_LIST=[
    "ssafy-project",
]

def get_s3_image_paths() -> list:
    image_paths = []
    for bucket_name in BUCKET_LIST:
        continuation_token = None
        while True:
            try:
                # S3에서 객체 목록 가져오기
                if continuation_token:
                    response = s3_client.list_objects_v2(
                        Bucket=bucket_name,
                        ContinuationToken=continuation_token
                    )
                else:
                    response = s3_client.list_objects_v2(
                        Bucket=bucket_name
                    )
                
                # 객체 경로 추가
                for obj in response.get('Contents', []):
                    key = obj.get('Key')
                    encoded_key = quote(key)
                    image_paths.append(f"https://{bucket_name}.s3.{os.getenv('S3_REGION_NAME')}.amazonaws.com/{encoded_key}")
                
                # 페이징: 추가 객체가 없으면 종료
                if not response.get('IsTruncated'):
                    break
                continuation_token = response.get('NextContinuationToken')
            except Exception as e:
                print(f"Bucket을 찾는데 실패했습니다. {bucket_name}: {e}")
                break
    return image_paths