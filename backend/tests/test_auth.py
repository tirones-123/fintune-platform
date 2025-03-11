from fastapi.testclient import TestClient
import pytest

def test_register(client):
    """Test user registration."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "password123",
            "name": "New User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"
    assert "id" in data
    assert "hashed_password" not in data

def test_register_existing_email(client, test_user):
    """Test registration with an existing email."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": test_user.email,
            "password": "password123",
            "name": "Duplicate User"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login(client, test_user):
    """Test user login."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.email,
            "password": "password"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["email"] == test_user.email

def test_login_wrong_password(client, test_user):
    """Test login with wrong password."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.email,
            "password": "wrong_password"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_login_inactive_user(client, test_user, db):
    """Test login with inactive user."""
    # Make user inactive
    test_user.is_active = False
    db.commit()
    
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.email,
            "password": "password"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Inactive user" 