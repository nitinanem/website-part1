"""
SWASTIK FastAPI Backend
-----------------------
Runs on: uvicorn main:app --reload --port 8000
Paired with the Next.js frontend on port 3000.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import assess, patient, clinician

app = FastAPI(
    title="SWASTIK AI Backend",
    description="Gait analysis and OA risk scoring pipeline",
    version="1.0.0",
)

# Allow Next.js dev server and production domain to call this API
origins = [
    "http://localhost:3000",
    os.getenv("NEXT_PUBLIC_FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assess.router, prefix="/api/assess", tags=["Assessment"])
app.include_router(patient.router, prefix="/api/patient", tags=["Patient"])
app.include_router(clinician.router, prefix="/api/clinician", tags=["Clinician"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "swastik-backend"}
