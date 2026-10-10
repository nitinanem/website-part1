"""
assess.py — FastAPI router
--------------------------
POST /api/assess/video
  Accepts a gait video upload, runs the full AI pipeline, and returns
  the OA risk score + biomechanical features.
"""

import os
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from pipeline.pose_extractor import extract_landmarks_from_video
from pipeline.feature_builder import build_features
from pipeline.model_runner import predict_oa_risk

router = APIRouter()

# Local upload directory (swap bucket name for Cloudflare R2 later)
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm"}
MAX_FILE_SIZE_MB = 100


@router.post("/video")
async def assess_video(
    video: UploadFile = File(...),
    patient_id: str = Form(...),
    assessment_id: str = Form(default=""),
):
    """
    Full gait analysis pipeline:
    1. Save video to local disk (or Cloudflare R2 in production)
    2. Extract MediaPipe landmarks frame-by-frame
    3. Compute biomechanical features
    4. Run XGBoost model → OA risk score + KAM estimate
    5. Return results as JSON
    """
    # ── Validate file type ─────────────────────────────────────────────────
    suffix = Path(video.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{suffix}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    # ── Save to disk ───────────────────────────────────────────────────────
    unique_name = f"{patient_id}_{uuid.uuid4().hex}{suffix}"
    save_path = UPLOAD_DIR / unique_name

    try:
        with save_path.open("wb") as f:
            shutil.copyfileobj(video.file, f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {e}")

    # ── Run AI pipeline ────────────────────────────────────────────────────
    try:
        frames = extract_landmarks_from_video(str(save_path))

        if len(frames) < 10:
            raise ValueError(
                f"Only {len(frames)} frames detected — video may be too short or pose detection failed."
            )

        features = build_features(frames)
        prediction = predict_oa_risk(features)

    except Exception as e:
        # Clean up the saved file if pipeline fails
        save_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=f"AI pipeline error: {str(e)}")

    # ── Compose response ───────────────────────────────────────────────────
    return JSONResponse(
        status_code=200,
        content={
            "patient_id":    patient_id,
            "assessment_id": assessment_id,
            "video_ref":     unique_name,  # store this in DB → Assessment.gaitVideoRef
            "features":      {k: v for k, v in features.items() if k not in ("total_frames", "video_duration_sec")},
            "prediction":    prediction,
            "metadata": {
                "total_frames":      features["total_frames"],
                "video_duration_sec": features["video_duration_sec"],
            },
        },
    )
