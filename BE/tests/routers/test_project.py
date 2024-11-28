import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_project_endpoint(async_client, auth_headers):
    data = {
        "project_name": "API Test Project",
        "project_model_task": "cls",
        "project_model_name": "efficientnet_v2_s",
        "description": "Testing project creation via API.",
        "accesscontrol": {
            "view_users": ["user1", "user2"],
            "edit_users": ["user3", "user4"],
            "view_departments": ["Engineering"],
            "edit_departments": ["Sales"]
        },
        "is_private": False
    }

    response = await async_client.post("/be/api/project/create", json=data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == 200
    project_id = response.json()["data"]
    return project_id

@pytest.mark.asyncio
async def test_get_project_list_endpoint(async_client, auth_headers):
    response = await async_client.get("/be/api/project/list?page=1&limit=5", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == 200
    assert isinstance(response.json()["data"]['data'], list)

@pytest.mark.asyncio
async def test_delete_project_endpoint(async_client, auth_headers):
    # 프로젝트 생성 후 삭제 테스트
    project_id = await test_create_project_endpoint(async_client, auth_headers)

    response = await async_client.delete(f"/be/api/project/delete/{project_id}", headers=auth_headers)
    assert response.status_code == 200
