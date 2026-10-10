"""
model_runner.py
---------------
Loads the XGBoost OA-risk model and runs inference on a feature vector.

▸ When the real .pkl file is available, copy it to:
      backend/models/oa_risk_model.pkl
  and the rest of this code works without any changes.

▸ Until then, a heuristic placeholder produces realistic demo scores.
"""

import os
import numpy as np
from pathlib import Path

# Optional: import joblib only if the model file actually exists
MODEL_PATH = Path(__file__).parent.parent / "models" / "oa_risk_model.pkl"

_model = None


def _load_model():
    global _model
    if _model is not None:
        return _model

    if MODEL_PATH.exists():
        import joblib  # installed via scikit-learn
        _model = joblib.load(MODEL_PATH)
        print(f"[model_runner] Loaded XGBoost model from {MODEL_PATH}")
    else:
        print(
            "[model_runner] WARNING: oa_risk_model.pkl not found. "
            "Using heuristic placeholder — replace with real model."
        )
        _model = "placeholder"

    return _model


# Feature order must match the order used during training
FEATURE_ORDER = [
    "left_knee_angle_mean",
    "left_knee_angle_std",
    "right_knee_angle_mean",
    "right_knee_angle_std",
    "cadence_steps_per_sec",
    "symmetry_index",
    "valgus_proxy",
    "min_left_knee_angle",
    "max_left_knee_angle",
    "min_right_knee_angle",
]


def predict_oa_risk(features: dict) -> dict:
    """
    Run OA risk inference.

    Args:
        features: Output dict from `build_features()`.

    Returns:
        {
          "oa_risk_score": float (0.0 – 1.0),
          "kam_estimate":  float (Nm/kg, proxy),
          "risk_label":    "low" | "moderate" | "high",
          "confidence":    float (0.0 – 1.0),
        }
    """
    model = _load_model()

    feature_vector = np.array(
        [features.get(k, 0.0) for k in FEATURE_ORDER], dtype=np.float32
    ).reshape(1, -1)

    if model == "placeholder":
        score = _heuristic_score(features)
    else:
        # Real XGBoost model — returns probability of OA class
        score = float(model.predict_proba(feature_vector)[0][1])

    # KAM estimate: scale risk score to a clinically plausible range
    # Real KAM in healthy adults ≈ 0.25 – 0.50 Nm/kg; OA patients > 0.60
    kam_estimate = 0.25 + score * 0.60

    if score < 0.35:
        label = "low"
    elif score < 0.65:
        label = "moderate"
    else:
        label = "high"

    # Confidence is higher when features are far from decision boundary
    confidence = min(1.0, abs(score - 0.5) * 2 + 0.5)

    return {
        "oa_risk_score": round(score, 4),
        "kam_estimate":  round(kam_estimate, 4),
        "risk_label":    label,
        "confidence":    round(confidence, 4),
    }


def _heuristic_score(features: dict) -> float:
    """
    Clinical-heuristic placeholder (no trained model required).
    Increases risk score when:
      - Knee angles are very small (limited ROM)
      - Symmetry is poor
      - Cadence is low
      - Valgus proxy is high
    """
    score = 0.0

    # Low mean knee flexion → reduced ROM → higher risk
    avg_angle = (features["left_knee_angle_mean"] + features["right_knee_angle_mean"]) / 2
    if avg_angle < 120:
        score += 0.20
    if avg_angle < 100:
        score += 0.15

    # High asymmetry → higher risk
    if features["symmetry_index"] > 10:
        score += 0.15
    if features["symmetry_index"] > 25:
        score += 0.10

    # Low cadence → reduced mobility
    if features["cadence_steps_per_sec"] < 1.5:
        score += 0.10

    # High valgus proxy → alignment issue
    if features["valgus_proxy"] > 0.08:
        score += 0.15
    if features["valgus_proxy"] > 0.12:
        score += 0.10

    return min(1.0, score)
