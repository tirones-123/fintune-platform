import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.session import Base, get_db
from app.core.security import get_password_hash
from app.models.user import User

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    
    # Create a new session for each test
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        
    # Drop the database tables
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    # Override the get_db dependency to use the test database
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Create a test client
    with TestClient(app) as c:
        yield c
    
    # Reset the dependency override
    app.dependency_overrides = {}

@pytest.fixture(scope="function")
def test_user(db):
    # Create a test user
    user = User(
        email="test@example.com",
        name="Test User",
        hashed_password=get_password_hash("password"),
        is_active=True,
        has_completed_onboarding=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

@pytest.fixture(scope="function")
def test_superuser(db):
    # Create a test superuser
    user = User(
        email="admin@example.com",
        name="Admin User",
        hashed_password=get_password_hash("admin_password"),
        is_active=True,
        is_superuser=True,
        has_completed_onboarding=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user 