from fastapi.testclient import TestClient
import pytest

def get_auth_header(client, email, password):
    """Helper function to get auth header."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": email,
            "password": password
        }
    )
    data = response.json()
    return {"Authorization": f"Bearer {data['access_token']}"}

def test_get_current_user(client, test_user):
    """Test getting current user info."""
    headers = get_auth_header(client, test_user.email, "password")
    response = client.get("/api/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["name"] == test_user.name
    assert "hashed_password" not in data

def test_update_user(client, test_user):
    """Test updating user info."""
    headers = get_auth_header(client, test_user.email, "password")
    response = client.put(
        "/api/users/me",
        headers=headers,
        json={
            "name": "Updated Name"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["email"] == test_user.email

def test_get_user_unauthorized(client):
    """Test getting user info without auth."""
    response = client.get("/api/users/me")
    assert response.status_code == 401

def test_update_user_unauthorized(client):
    """Test updating user info without auth."""
    response = client.put(
        "/api/users/me",
        json={
            "name": "Updated Name"
        }
    )
    assert response.status_code == 401 