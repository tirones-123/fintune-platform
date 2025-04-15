from sqlalchemy.orm import Session
import logging
from datetime import datetime, timedelta

from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project
from app.models.content import Content
from app.models.dataset import Dataset, DatasetContent, DatasetPair
from app.models.fine_tuning import FineTuning
from app.core.config import settings

logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    """
    Initialize the database with test data.
    """
    logger.info("Creating initial data")
    
    # Create test user
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        test_user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=get_password_hash("password"),
            is_active=True,
            has_completed_onboarding=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        logger.info(f"Created test user: {test_user.email}")
    
    # Create admin user
    admin_user = db.query(User).filter(User.email == "admin@finetuner.io").first()
    if not admin_user:
        admin_user = User(
            email="admin@finetuner.io",
            name="Admin User",
            hashed_password=get_password_hash("admin_password"),
            is_active=True,
            is_superuser=True,
            has_completed_onboarding=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        logger.info(f"Created admin user: {admin_user.email}")
    
    # Create test project
    test_project = db.query(Project).filter(
        Project.user_id == test_user.id,
        Project.name == "Test Project"
    ).first()
    if not test_project:
        test_project = Project(
            user_id=test_user.id,
            name="Test Project",
            description="A test project for demonstration",
            status="active"
        )
        db.add(test_project)
        db.commit()
        db.refresh(test_project)
        logger.info(f"Created test project: {test_project.name}")
    
    # Create test content
    test_content = db.query(Content).filter(
        Content.project_id == test_project.id,
        Content.name == "Test Content"
    ).first()
    if not test_content:
        test_content = Content(
            project_id=test_project.id,
            name="Test Content",
            description="A test content item",
            type="text",
            status="processed",
            size=1024
        )
        db.add(test_content)
        db.commit()
        db.refresh(test_content)
        logger.info(f"Created test content: {test_content.name}")
    
    # Create test dataset
    test_dataset = db.query(Dataset).filter(
        Dataset.project_id == test_project.id,
        Dataset.name == "Test Dataset"
    ).first()
    if not test_dataset:
        test_dataset = Dataset(
            project_id=test_project.id,
            name="Test Dataset",
            description="A test dataset",
            status="ready",
            model="gpt-3.5-turbo",
            pairs_count=2
        )
        db.add(test_dataset)
        db.commit()
        db.refresh(test_dataset)
        logger.info(f"Created test dataset: {test_dataset.name}")
        
        # Link content to dataset
        test_dataset_content = DatasetContent(
            dataset_id=test_dataset.id,
            content_id=test_content.id
        )
        db.add(test_dataset_content)
        
        # Add sample pairs
        sample_pairs = [
            DatasetPair(
                dataset_id=test_dataset.id,
                question="What is fine-tuning?",
                answer="Fine-tuning is the process of further training a pre-trained language model on a specific dataset to adapt it to a particular task or domain."
            ),
            DatasetPair(
                dataset_id=test_dataset.id,
                question="Why is fine-tuning useful?",
                answer="Fine-tuning is useful because it allows you to customize a general-purpose language model to perform better on specific tasks, using less data and computing resources than training a model from scratch."
            )
        ]
        db.add_all(sample_pairs)
        db.commit()
        logger.info(f"Added sample pairs to test dataset")
    
    # Create test fine-tuning
    test_fine_tuning = db.query(FineTuning).filter(
        FineTuning.dataset_id == test_dataset.id,
        FineTuning.name == "Test Fine-tuning"
    ).first()
    if not test_fine_tuning:
        test_fine_tuning = FineTuning(
            dataset_id=test_dataset.id,
            name="Test Fine-tuning",
            description="A test fine-tuning job",
            status="completed",
            model="gpt-3.5-turbo",
            provider="openai",
            progress=100.0,
            external_id="ft-test",
            completed_at=datetime.now()
        )
        db.add(test_fine_tuning)
        db.commit()
        db.refresh(test_fine_tuning)
        logger.info(f"Created test fine-tuning: {test_fine_tuning.name}")
    
    logger.info("Initial data created") 