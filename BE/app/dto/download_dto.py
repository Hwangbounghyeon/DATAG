from pydantic import BaseModel
from typing import List

class DownloadRequest(BaseModel):
    image_list: List[str]