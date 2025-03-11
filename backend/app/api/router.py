from fastapi import APIRouter

from app.api.endpoints import auth, users, projects, contents, datasets, fine_tunings, payments

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(contents.router, prefix="/contents", tags=["contents"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(fine_tunings.router, prefix="/fine-tunings", tags=["fine-tunings"])
api_router.include_router(payments.router, prefix="/checkout", tags=["payments"]) 