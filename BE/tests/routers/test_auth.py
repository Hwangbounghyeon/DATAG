import pytest
from httpx import AsyncClient
from unittest.mock import patch
from fastapi import HTTPException
from app.main import app
from app.services.auth.auth_service import UserCreate, EmailValidate, JWTManage, UserLogin, UserLogout
from app.models.mariadb_users import Users
from app.dto.users_dto import UserSignUp, UserSignIn, TokenResponse

@pytest.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def sample_user_data():
    return UserSignUp(
        email="test@example.com",
        password="password123",
        name="John Doe"
    )

@pytest.mark.asyncio
async def test_signup_success(async_client, sample_user_data):
    with patch.object(UserCreate, "create_temp_user", return_value={"email": sample_user_data.email, "password": "hashed_password"}):
        with patch.object(EmailValidate, "send_verification_email", return_value=None):
            response = await async_client.post("/auth/signup", json=sample_user_data.model_dump())
            assert response.status_code == 201
            assert response.json()["data"]["message"] == "이메일 인증 코드가 발송되었습니다."

@pytest.mark.asyncio
async def test_signup_existing_email(async_client, sample_user_data):
    with patch.object(UserCreate, "create_temp_user", side_effect=HTTPException(status_code=400, detail="해당 이메일이 이미 존재합니다.")):
        response = await async_client.post("/auth/signup", json=sample_user_data.model_dump())
        assert response.status_code == 400
        assert response.json()["detail"] == "해당 이메일이 이미 존재합니다."

@pytest.mark.asyncio
async def test_verification_success(async_client):
    email = "test@example.com"
    code = "123456"
    user = Users(user_id=1, email=email)
    
    with patch.object(EmailValidate, "verify_and_create_user", return_value=user):
        with patch.object(JWTManage, "create_access_token", return_value="access_token"):
            with patch.object(JWTManage, "create_refresh_token", return_value="refresh_token"):
                response = await async_client.post("/auth/verification", json={"email": email, "code": code})
                assert response.status_code == 200
                assert response.json()["data"]["access_token"] == "access_token"
                assert response.json()["data"]["refresh_token"] == "refresh_token"

@pytest.mark.asyncio
async def test_verification_invalid_code(async_client):
    email = "test@example.com"
    code = "wrong_code"
    
    with patch.object(EmailValidate, "verify_and_create_user", side_effect=HTTPException(status_code=400, detail="유효하지 않은 인증코드입니다")):
        response = await async_client.post("/auth/verification", json={"email": email, "code": code})
        assert response.status_code == 400
        assert response.json()["detail"] == "유효하지 않은 인증코드입니다"

@pytest.mark.asyncio
async def test_login_success(async_client):
    login_data = UserSignIn(email="test@example.com", password="password123")
    
    with patch.object(UserLogin, "login", return_value=TokenResponse(access_token="access_token", refresh_token="refresh_token")):
        response = await async_client.post("/auth/login", json=login_data.model_dump())
        assert response.status_code == 200
        assert response.json()["data"]["access_token"] == "access_token"
        assert response.json()["data"]["refresh_token"] == "refresh_token"

@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client):
    login_data = UserSignIn(email="test@example.com", password="wrong_password")
    
    with patch.object(UserLogin, "login", side_effect=HTTPException(status_code=401, detail="비밀번호가 틀렸습니다.")):
        response = await async_client.post("/auth/login", json=login_data.model_dump())
        assert response.status_code == 401
        assert response.json()["detail"] == "비밀번호가 틀렸습니다."

@pytest.mark.asyncio
async def test_logout_success(async_client):
    access_token = "access_token"
    
    with patch.object(UserLogout, "logout", return_value={"message": "로그아웃 되었습니다"}):
        response = await async_client.post("/auth/logout", headers={"Authorization": f"Bearer {access_token}"})
        assert response.status_code == 200
        assert response.json()["data"]["message"] == "로그아웃 되었습니다"

@pytest.mark.asyncio
async def test_refresh_token_success(async_client):
    access_token = "refresh_token"
    user = Users(user_id=1, email="test@example.com")
    
    with patch.object(JWTManage, "verify_token", return_value={"user_id": 1, "token_type": "refresh"}):
        with patch("app.main.get_database_mariadb", return_value=None):
            with patch.object(JWTManage, "create_access_token", return_value="new_access_token"):
                with patch.object(JWTManage, "create_refresh_token", return_value="new_refresh_token"):
                    response = await async_client.post("/auth/refresh", headers={"Authorization": f"Bearer {access_token}"})
                    assert response.status_code == 200
                    assert response.json()["data"]["access_token"] == "new_access_token"
                    assert response.json()["data"]["refresh_token"] == "new_refresh_token"
