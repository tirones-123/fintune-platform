from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FinTune Platform API",
    description="API for the FinTune Platform - A SaaS for automated fine-tuning dataset generation",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"message": "Welcome to FinTune Platform API"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/api/payments/balance")
async def get_credit_balance():
    """Mock endpoint for credit balance."""
    return {"credit_balance": 100.0}

@app.get("/api/payments/usage")
async def get_usage_records():
    """Mock endpoint for usage records."""
    return [
        {
            "id": "1",
            "usage_type": "content_processing",
            "quantity": 5.2,
            "unit_price": 0.05,
            "total_cost": 0.26,
            "description": "Processing PDF document",
            "created_at": "2023-03-07T12:00:00Z"
        },
        {
            "id": "2",
            "usage_type": "dataset_generation",
            "quantity": 10,
            "unit_price": 0.1,
            "total_cost": 1.0,
            "description": "Generating QA pairs",
            "created_at": "2023-03-07T13:00:00Z"
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 