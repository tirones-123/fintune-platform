from celery import Celery
import os
from dotenv import load_dotenv
from loguru import logger

from app.core.config import settings

# Load environment variables
load_dotenv()

# Get Redis URL from environment or use default
redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Create Celery instance
celery_app = Celery(
    "fintune_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_hijack_root_logger=False,
    task_routes={
        "app.tasks.content_processing.*": {"queue": "content_processing"},
        "app.tasks.dataset_generation.*": {"queue": "dataset_generation"},
        "app.tasks.fine_tuning.*": {"queue": "fine_tuning"},
    },
)

# Import tasks to register them
from app.tasks import content_processing, dataset_generation, fine_tuning

# Example task for testing
@celery_app.task
def example_task(name):
    logger.info(f"Running example task for {name}")
    return f"Hello {name}!"

if __name__ == "__main__":
    celery_app.start() 