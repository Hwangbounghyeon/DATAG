import pytest
from fastapi import HTTPException
from httpx import AsyncClient
from unittest.mock import patch
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'app')))

from app.main import app
from app.services.project.history_service import HistoryService


# 히스토리 리스트 조회 성공
@pytest.mark.asyncio
async def test_get_history_list_router(async_client, auth_headers):
    project_id = "673fd560068f6aaf7cf089d8"
    response = await async_client.get(f"be/api/project/history/{project_id}/list?page=1&limit=10", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == 200

# 히스토리 상세 조회 성공
@pytest.mark.asyncio
async def test_get_history_detail_router(async_client, auth_headers):
    history_id = "673fdd699a6580ece261a525"
    response = await async_client.get(f"be/api/project/history/detail/{history_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == 200

# 히스토리 삭제 성공
@pytest.mark.asyncio
async def test_delete_history_router(async_client, auth_headers):
    history_id = "673fdd699a6580ece261a525"
    with patch.object(HistoryService, 'delete_history') as mock_delete_history:
        mock_delete_history.return_value = None
        response = await async_client.delete(f"be/api/project/history/delete/{history_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["status"] == 200

# 인증되지 않은 요청 처리
@pytest.mark.asyncio
async def test_get_history_list_unauthorized_router(async_client):
    project_id = "673fd560068f6aaf7cf089d8"
    response = await async_client.get(f"be/api/project/history/{project_id}/list?page=1&limit=10")
    assert response.status_code == 403  # Unauthorized

# 존재하지 않는 히스토리 삭제 시도
@pytest.mark.asyncio
async def test_delete_history_not_found_router(async_client, auth_headers):
    history_id = "nonexistent_history_id"
    with patch.object(HistoryService, 'delete_history', side_effect=HTTPException(status_code=404, detail="History not found")):
        response = await async_client.delete(f"be/api/project/history/delete/{history_id}", headers=auth_headers)
        assert response.status_code == 500
