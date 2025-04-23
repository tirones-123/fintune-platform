# FineTuner Platform Backend

This is the backend API for the FineTuner Platform, a SaaS application for fine-tuning language models.

## Features

- User authentication and management
- Project management
- Content processing (PDF, text, YouTube, etc.)
- Dataset generation
- Fine-tuning management
- Subscription and payment handling

## Tech Stack

- FastAPI
- SQLAlchemy
- PostgreSQL
- Celery
- Redis
- Stripe
- OpenAI, Anthropic, and Mistral AI integrations

## Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL
- Redis

### Installation

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and update the values
5. Run the application:
   ```
   uvicorn main:app --reload
   ```

### Docker

You can also run the application using Docker:

```
docker-compose up -d
```

## API Documentation

API documentation is available at:

- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`
- OpenAPI JSON: `/api/openapi.json`

## Database Migrations

Database migrations are managed with Alembic:

```
# Create a new migration
alembic revision --autogenerate -m "Migration message"

# Apply migrations
alembic upgrade head
```

## Testing

Run tests with pytest:

```
python run_tests.py
```

Or directly with pytest:

```
pytest -v tests/
```

## Project Structure

- `app/`: Main application package
  - `api/`: API endpoints
  - `core/`: Core functionality (config, security)
  - `db/`: Database setup and session management
  - `models/`: SQLAlchemy models
  - `schemas/`: Pydantic schemas
  - `services/`: Business logic services
  - `tasks/`: Celery tasks
- `alembic/`: Database migrations
- `tests/`: Test suite
- `main.py`: Application entry point
- `celery_app.py`: Celery configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details. 