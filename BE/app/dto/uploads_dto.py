from pydantic import BaseModel

class UploadRequest(BaseModel):
    project_id: str
    is_private: bool

    model_config = {
        "protected_namespaces": ()
    }