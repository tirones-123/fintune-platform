from fastapi import APIRouter

from app.api.endpoints import (
    auth, users, projects, contents, datasets, fine_tunings, payments, characters,
    api_keys, web_scraping, video_transcription, helpers, notifications,
    fine_tuning_jobs
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(contents.router, prefix="/contents", tags=["contents"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(fine_tunings.router, prefix="/fine-tunings", tags=["fine-tunings"])
api_router.include_router(payments.router, prefix="/checkout", tags=["payments"])
api_router.include_router(characters.router, prefix="/characters", tags=["characters"])
api_router.include_router(api_keys.router, prefix="/users/me/api-keys", tags=["api-keys"])
api_router.include_router(web_scraping.router, prefix="/helpers", tags=["helpers"])
api_router.include_router(video_transcription.router, prefix="/helpers", tags=["helpers"])
api_router.include_router(helpers.router, prefix="/helpers", tags=["helpers"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(fine_tuning_jobs.router, prefix="/fine-tuning-jobs", tags=["fine-tuning-jobs"]) 