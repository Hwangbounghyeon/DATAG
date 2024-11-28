import pytest
import json
from httpx import AsyncClient
from .test_project import test_create_project_endpoint

@pytest.mark.asyncio
async def test_image_upload_success(async_client, auth_headers):
    project_id = await test_create_project_endpoint(async_client, auth_headers)
    upload_request = {
        "project_id": f"{project_id}",
        "is_private": "false"
    }
    files = [
        ("files", ("test1.jpg", b"file_content_1", "image/jpeg")),
        ("files", ("test2.jpg", b"file_content_2", "image/jpeg"))
    ]

    response = await async_client.post(
        "be/api/project/image/upload",
        data={"upload_request": json.dumps(upload_request)},
        files=files,
        headers=auth_headers
    )

    assert response.status_code == 200
    assert response.json() == {
        "status": 200,
        "data": "이미지 업로드에 성공하였습니다."
    }

@pytest.mark.asyncio
async def test_image_upload_no_files(async_client, auth_headers):
    project_id = await test_create_project_endpoint(async_client, auth_headers)
    upload_request = {
        "project_id": f"{project_id}",
        "is_private": "false",
    }

    response = await async_client.post(
        "be/api/project/image/upload",
        data={"upload_request": json.dumps(upload_request)},
        files=[],
        headers=auth_headers
    )

    print(response.json())

    assert response.status_code == 200
