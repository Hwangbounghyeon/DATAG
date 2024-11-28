import pytest
from unittest.mock import patch, AsyncMock
from app.dto.image_detail_dto import ImageDetailTagAddRequest, ImageDetailTagRemoveRequest


# 태그 추가 테스트
@pytest.mark.asyncio
async def test_add_image_tag(async_client, auth_headers):
    request_data = ImageDetailTagAddRequest(
        image_id="673fda8c14cdfbe937b75019",
        tag_list=["new_tag1", "new_tag2"]
    )
    
    with patch("app.services.image.image_extra_service.ImageExtraService.add_image_tag", new_callable=AsyncMock) as mock_add_image_tag:
        mock_add_image_tag.return_value = {
            "image_id": request_data.image_id,
            "tag_name_list": request_data.tag_list
        }
        
        response = await async_client.post(
            "/be/api/image/tag/add",
            json=request_data.dict(),
            headers=auth_headers
        )

        print(response.json())

        assert response.status_code == 200
        assert "data" in response.json()
        assert "tag_name_list" in response.json()["data"]

# 태그 삭제 테스트
@pytest.mark.asyncio
async def test_remove_image_tag(async_client, auth_headers):
    request_data = ImageDetailTagRemoveRequest(
        image_id="673fda8c14cdfbe937b75019",
        remove_tag_list=["new_tag1", "new_tag2"]
    )
    
    with patch("app.services.image.image_extra_service.ImageExtraService.delete_image_tag", new_callable=AsyncMock) as mock_delete_image_tag:
        mock_delete_image_tag.return_value = {
            "image_id": request_data.image_id,
            "tag_name_list": []
        }
        
        response = await async_client.post(
            "/be/api/image/tag/remove",
            json=request_data.dict(),
            headers=auth_headers
        )

        assert response.status_code == 200
        assert "data" in response.json()
        assert "tag_name_list" in response.json()["data"]

# 태그 리스트 불러오기 테스트
@pytest.mark.asyncio
async def test_get_tags_and_images(async_client, auth_headers):
    with patch("app.services.image.image_service.ImageService.get_tag", new_callable=AsyncMock) as mock_get_tag:
        mock_get_tag.return_value = {
            "tags": ["existing_tag1", "existing_tag2"]
        }
        
        response = await async_client.get(
            "/be/api/image/tag/list",
            headers=auth_headers
        )

        assert response.status_code == 200
        assert "data" in response.json()
        assert "tags" in response.json()["data"]
