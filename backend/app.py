from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="DevTrackr API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root and Health Check
@app.get("/")
async def root():
    return {"message": "DevTrackr is Active!🚀"}

@app.get("/healthz")
async def health_check():
    return {"status": "ok"}
