"""
patient.py — FastAPI router
---------------------------
GET /api/patient/{id}/history
  Returns a patient's daily self-monitoring history (journal entries + 
  assessment scores) for trend visualization on the clinician dashboard.
"""

import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


def _get_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL not set in environment")
    return psycopg2.connect(db_url)


@router.get("/{patient_id}/history")
def get_patient_history(patient_id: str, limit: int = 30):
    """
    Fetch a patient's recent journal entries + assessment OA risk scores.

    Returns:
    {
        "patient_id": str,
        "journal": [ { date, pain_level, location, mobility_score, ... } ],
        "assessments": [ { created_at, risk_score, kam_estimate, ... } ]
    }
    """
    try:
        conn = _get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # ── Journal entries ────────────────────────────────────────────────
        cur.execute(
            """
            SELECT date, pain_level, location, notes, mobility_score,
                   kl_grade, radiology_recommended, created_at
            FROM   journal_entries
            WHERE  patient_id = %s
            ORDER  BY created_at DESC
            LIMIT  %s
            """,
            (patient_id, limit),
        )
        journal = [dict(r) for r in cur.fetchall()]

        # ── Assessments ────────────────────────────────────────────────────
        cur.execute(
            """
            SELECT id, status, source, risk_score, gait_video_ref,
                   created_at, updated_at
            FROM   assessments
            WHERE  patient_id = %s
            ORDER  BY created_at DESC
            LIMIT  %s
            """,
            (patient_id, limit),
        )
        assessments = [dict(r) for r in cur.fetchall()]

        cur.close()
        conn.close()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return JSONResponse(
        content={
            "patient_id":  patient_id,
            "journal":     journal,
            "assessments": assessments,
        }
    )
