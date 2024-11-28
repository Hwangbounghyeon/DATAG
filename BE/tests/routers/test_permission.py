import pytest

# 부서 권한 추가 테스트
@pytest.mark.asyncio
async def test_add_department_permission(async_client, auth_headers):
    request_data = {
        "image_id": "673fda8c14cdfbe937b75019",
        "department_name_list": ["IT"]
    }
    response = await async_client.post(
        "/be/api/image/permission/addDepartment",
        json=request_data,
        headers=auth_headers
    )

    print(response.json())
    assert response.status_code == 200
    assert response.json()["status"] == 200

# 사용자 권한 추가 테스트
@pytest.mark.asyncio
async def test_add_user_permission(async_client, auth_headers):
    request_data = {
        "image_id": "673fda8c14cdfbe937b75019",
        "user_id_list": [123]
    }
    response = await async_client.post(
        "/be/api/image/permission/addUser",
        json=request_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == 200

# 사용자 권한 삭제 테스트
@pytest.mark.asyncio
async def test_remove_user_permission(async_client, auth_headers):
    request_data = {
        "image_id": "673fda8c14cdfbe937b75019",
        "user_id_list": [123]
    }
    response = await async_client.post(
        "/be/api/image/permission/removeUser",
        json=request_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == 200

# 부서 권한 삭제 테스트
@pytest.mark.asyncio
async def test_remove_department_permission(async_client, auth_headers):
    request_data = {
        "image_id": "673fda8c14cdfbe937b75019",
        "department_name_list": ["IT"]
    }
    response = await async_client.post(
        "/be/api/image/permission/removeDepartment",
        json=request_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == 200
