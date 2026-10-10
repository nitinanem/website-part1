"""
clinician.py — FastAPI router
------------------------------
GET /api/clinician/dashboard/{clinician_id}
  Aggregates multimodal AI evidence for all patients assigned to a clinician.
  Returns KAM trends, risk scores, and flagged alerts for review.
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


@router.get("/dashboard/{clinician_id}")
def get_clinician_dashboard(clinician_id: str):
    """
    Aggregated dashboard view for a clinician.

    Returns:
    {
        "clinician_id": str,
        "total_patients": int,
        "pending_reviews": int,
        "flagged_cases": int,
        "patients": [
            {
                "id", "name", "age", "gender", "email",
                "latest_risk_score", "latest_assessment_date",
                "status", "avg_pain_7d", "trend"
            }
        ]
    }
    """
    try:
        conn = _get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # ── Get all patients assigned to this clinician ────────────────────
        cur.execute(
            """
            SELECT
                p.id, p.name, p.age, p.gender, p.email,
                p.primary_joint,
                a.status        AS assessment_status,
                a.risk_score    AS latest_risk_score,
                a.created_at    AS latest_assessment_date
            FROM   patients p
            LEFT JOIN LATERAL (
                SELECT status, risk_score, created_at
                FROM   assessments
                WHERE  patient_id = p.id
                ORDER  BY created_at DESC
                LIMIT  1
            ) a ON true
            WHERE  p.allotted_doctor_id = (
                SELECT id FROM doctors WHERE user_id = %s LIMIT 1
            )
            ORDER  BY a.created_at DESC NULLS LAST
            """,
            (clinician_id,),
        )
        patients_raw = [dict(r) for r in cur.fetchall()]

        # ── Enrich with 7-day average pain ────────────────────────────────
        patient_ids = [p["id"] for p in patients_raw]
        avg_pain_map = {}

        if patient_ids:
            placeholders = ",".join(["%s"] * len(patient_ids))
            cur.execute(
                f"""
                SELECT patient_id, AVG(pain_level)::numeric(4,2) AS avg_pain
                FROM   journal_entries
                WHERE  patient_id IN ({placeholders})
                  AND  created_at >= NOW() - INTERVAL '7 days'
                GROUP  BY patient_id
                """,
                patient_ids,
            )
            for row in cur.fetchall():
                avg_pain_map[row["patient_id"]] = float(row["avg_pain"])

        cur.close()
        conn.close()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    # ── Build enriched patient list ────────────────────────────────────────
    patients = []
    pending_reviews = 0
    flagged_cases = 0

    for p in patients_raw:
        risk_score = p.get("latest_risk_score")
        status = p.get("assessment_status") or "no_assessment"
        avg_pain = avg_pain_map.get(p["id"])

        if status == "pending_review":
            pending_reviews += 1
        if status == "flagged":
            flagged_cases += 1

        # Simple trend: derive from risk_score until we have time-series data
        if risk_score and isinstance(risk_score, dict):
            score_val = risk_score.get("oa_risk_score", 0)
            trend = "high" if score_val > 0.65 else ("moderate" if score_val > 0.35 else "low")
        else:
            trend = "unknown"

        patients.append({
            "id":                      p["id"],
            "name":                    p["name"],
            "age":                     p.get("age"),
            "gender":                  p.get("gender"),
            "email":                   p.get("email"),
            "primary_joint":           p.get("primary_joint"),
            "assessment_status":       status,
            "latest_risk_score":       risk_score,
            "latest_assessment_date":  str(p["latest_assessment_date"]) if p.get("latest_assessment_date") else None,
            "avg_pain_7d":             avg_pain,
            "trend":                   trend,
        })

    return JSONResponse(
        content={
            "clinician_id":   clinician_id,
            "total_patients": len(patients),
            "pending_reviews": pending_reviews,
            "flagged_cases":   flagged_cases,
            "patients":        patients,
        }
    )
