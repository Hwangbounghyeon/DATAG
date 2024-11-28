import pytest

# 수동 차원축소 테스트
@pytest.mark.asyncio
async def test_dimension_reduction_manual(async_client, auth_headers):
    request_data = {
        "project_id": "673fd560068f6aaf7cf089d8",
        "is_private": True,
        "history_name": "Manual Test",
        "algorithm": "tsne",
        "image_ids": [
        "673fda9e14cdfbe937b7505d",
        "673fda9414cdfbe937b75039",
        "673fda9714cdfbe937b75045",
        "673fda9214cdfbe937b75031",
        "673fda9d14cdfbe937b75059",
        "673fda9614cdfbe937b75041",
        "673fda8e14cdfbe937b75025",
        "673fda9b14cdfbe937b75051",
        "673fda9314cdfbe937b75035",
        "673fda9514cdfbe937b7503d",
        "673fda9f14cdfbe937b75061",
        "673fdaa214cdfbe937b7506d",
        "673fda8d14cdfbe937b75021",
        "673fdab014cdfbe937b7509d",
        "673fda8c14cdfbe937b75019",
        "673fda8f14cdfbe937b75029",
        "673fda9a14cdfbe937b7504d",
        "673fdaa114cdfbe937b75069",
        "673fdaa814cdfbe937b75081",
        "673fdaaf14cdfbe937b75099",
        "673fdab114cdfbe937b750a1",
        "673fda9814cdfbe937b75049",
        "673fdaae14cdfbe937b75095",
        "673fdaa414cdfbe937b75075",
        "673fda9114cdfbe937b7502d",
        "673fdaa714cdfbe937b7507d",
        "673fdaa014cdfbe937b75065",
        "673fda9c14cdfbe937b75055",
        "673fdaac14cdfbe937b7508d",
        "673fdaa314cdfbe937b75071",
        "673fdaaa14cdfbe937b75089",
        "673fdaa614cdfbe937b75079",
        "673fdaa914cdfbe937b75085",
        "673fdaad14cdfbe937b75091"
        ],
        "selected_tags": []
    }
    response = await async_client.post(
        "/be/api/project/analysis/manual",
        json=request_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == 200

# 자동 차원축소 테스트
@pytest.mark.asyncio
async def test_dimension_reduction_auto(async_client, auth_headers):
    request_data = {
        "project_id": "673fd560068f6aaf7cf089d8",
        "is_private": False,
        "history_name": "Auto Test",
        "algorithm": "umap",
        "selected_tags": []
    }
    response = await async_client.post(
        "/be/api/project/analysis/auto",
        json=request_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == 200

