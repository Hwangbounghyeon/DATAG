import pytest


# 이미지 정보 조회 테스트
@pytest.mark.asyncio
async def test_get_image_detail(async_client, auth_headers):
    request_data = {
        "image_id": "673fda8c14cdfbe937b75019",
        "conditions": []
    }
    response = await async_client.post(
        "/be/api/image/detail",
        json=request_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == 200

# 이미지 검색 테스트
@pytest.mark.asyncio
async def test_search_images(async_client, auth_headers):
    request_data = {
        "conditions": [],
    }
    response = await async_client.post(
        "/be/api/image/search?page=1&limit=10",
        json=request_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == 200

# 권한 없는 사용자 테스트
@pytest.mark.asyncio
async def test_get_image_detail_permission_denied(async_client, auth_headers):
    request_data = {
        "image_id": "unauthorized_image_id",
        "conditions": []
    }
    response = await async_client.post(
        "/be/api/image/detail",
        json=request_data,
        headers=auth_headers
    )
    assert response.status_code == 403  # Permission Denied
