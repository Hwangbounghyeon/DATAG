import pytest

# 다운로드 요청 시 성공
@pytest.mark.asyncio
async def test_download_success(async_real_client, auth_headers):
    request_data = {
        "image_list": ["673fda8c14cdfbe937b75019"]
    }
    response = await async_real_client.post("be/api/image/download", json=request_data, headers=auth_headers)
    print(response.json())
    print(f"Response content: {response.content}")
    
    assert response.status_code == 200

# 다운로드 요청 시 token 제외
@pytest.mark.asyncio
async def test_download_unauthorized(async_real_client):
    request_data = {
        "image_list": ["673fda8c14cdfbe937b75019"]
    }
    response = await async_real_client.post("be/api/image/download", json=request_data)
    
    assert response.status_code == 403  # 인증 실패

# 다운로드 시 잘못된 request 요청
@pytest.mark.asyncio
async def test_download_invalid_data(async_real_client, auth_headers):
    invalid_data = {"invalid_key": "invalid_value"}
    response = await async_real_client.post("be/api/image/download", json=invalid_data, headers=auth_headers)
    
    assert response.status_code == 422  # 유효성 검사 실패

# 다운로드시 이미지 제외
@pytest.mark.asyncio
async def test_download_empty_list(async_real_client, auth_headers):
    request_data = {
        "image_list": []
    }
    response = await async_real_client.post("be/api/image/download", json=request_data, headers=auth_headers)

    assert response.status_code == 404
    assert response.json()["detail"] == "이미지가 존재하지 않습니다."
