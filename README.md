# FinTune Platform

A SaaS platform for automated fine-tuning dataset generation from various content sources.

## Overview

FinTune Platform allows users to easily create fine-tuning datasets for language models like GPT and Claude. The platform can ingest content from various sources (text, PDF, YouTube), process it, and automatically generate question-answer pairs in the format required for fine-tuning.

## Features

### Content Ingestion
- Upload text files and PDFs
- Provide YouTube links for automatic transcription
- Store and manage content in the cloud

### Content Processing
- Automatic chunking of text into appropriate segments
- Intelligent processing to maintain context
- Support for various languages and formats

### Dataset Generation
- Automatic generation of diverse question-answer pairs
- Customizable system prompts and generation parameters
- Preview and edit generated pairs before finalizing

### Fine-Tuning Integration
- Direct integration with OpenAI and Anthropic APIs
- Fine-tuning job management and monitoring
- Testing interface for fine-tuned models

### User Management
- Multi-user support with role-based access control
- Project organization and sharing
- Usage tracking and billing

## Architecture

### Backend
- Python-based API using FastAPI
- Celery for asynchronous task processing
- PostgreSQL for structured data
- MongoDB for storing documents and datasets
- Redis for caching and task queue

### Frontend
- React with TypeScript
- Material-UI for component library
- Redux for state management

### Infrastructure
- Docker containers for all services
- Kubernetes for orchestration
- AWS S3 for file storage
- AWS ECS/EKS for container management

## API Design

The platform is built around a RESTful API with the following main endpoints:

- `/api/auth` - Authentication and user management
- `/api/projects` - Project CRUD operations
- `/api/sources` - Content source management
- `/api/processing` - Content processing operations
- `/api/datasets` - Dataset generation and management
- `/api/fine-tuning` - Fine-tuning job management

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker and Docker Compose
- AWS account (for production deployment)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/tirones-123/fintune-platform.git
cd fintune-platform

# Set up backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Set up frontend
cd ../frontend
npm install
npm start
```

### Docker Setup
```bash
docker-compose up -d
```

## License

MIT