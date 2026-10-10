"""
feature_builder.py
------------------
Takes the raw per-frame landmark data from pose_extractor and computes
biomechanical features used by the ML model:

  - Mean / std of knee flexion angles (left & right)
  - Stride cadence (steps per second, estimated from ankle vertical motion)
  - Step symmetry index  (how evenly left/right side loads are distributed)
  - Hip-knee-ankle alignment score (proxy for varus/valgus deformity)

These 10 features are passed directly to model_runner.py.
"""

import numpy as np
from pipeline.pose_extractor import compute_joint_angles


def build_features(frames: list[dict]) -> dict:
    """
    Compute a flat feature vector from a sequence of landmark frames.

    Args:
        frames: Output of `extract_landmarks_from_video`.

    Returns:
        A dict with 10 numerical features + metadata.
    """
    if not frames:
        raise ValueError("No frames available — pose extraction may have failed.")

    fps = frames[0]["fps"]

    # ── Knee angles ──────────────────────────────────────────────────────────
    left_angles = []
    right_angles = []
    for f in frames:
        angles = compute_joint_angles(f)
        left_angles.append(angles["left_knee_angle"])
        right_angles.append(angles["right_knee_angle"])

    la = np.array(left_angles)
    ra = np.array(right_angles)

    # ── Cadence estimation ───────────────────────────────────────────────────
    # Count peaks in left ankle Y (each upward swing = one step)
    left_ankle_y = np.array([f["landmarks"]["left_ankle"]["y"] for f in frames])
    right_ankle_y = np.array([f["landmarks"]["right_ankle"]["y"] for f in frames])
    cadence = _estimate_cadence(left_ankle_y, right_ankle_y, fps)

    # ── Symmetry index ───────────────────────────────────────────────────────
    # Symmetry Index (SI) = 2 * |L - R| / (L + R) * 100  (0% = perfectly symmetric)
    mean_diff = abs(float(la.mean()) - float(ra.mean()))
    mean_sum  = float(la.mean()) + float(ra.mean()) + 1e-9
    symmetry_index = 2 * mean_diff / mean_sum * 100

    # ── Hip-knee-ankle valgus proxy ──────────────────────────────────────────
    # Compare hip X vs knee X — large medial shift = valgus risk
    hip_knee_offsets = []
    for f in frames:
        lm = f["landmarks"]
        left_offset  = abs(lm["left_hip"]["x"]  - lm["left_knee"]["x"])
        right_offset = abs(lm["right_hip"]["x"] - lm["right_knee"]["x"])
        hip_knee_offsets.append((left_offset + right_offset) / 2)
    mean_valgus_proxy = float(np.mean(hip_knee_offsets))

    features = {
        # Features fed to the ML model (order matters — must match training)
        "left_knee_angle_mean":  float(la.mean()),
        "left_knee_angle_std":   float(la.std()),
        "right_knee_angle_mean": float(ra.mean()),
        "right_knee_angle_std":  float(ra.std()),
        "cadence_steps_per_sec": cadence,
        "symmetry_index":        symmetry_index,
        "valgus_proxy":          mean_valgus_proxy,
        "min_left_knee_angle":   float(la.min()),
        "max_left_knee_angle":   float(la.max()),
        "min_right_knee_angle":  float(ra.min()),
        # Metadata (not fed to model)
        "total_frames":          len(frames),
        "video_duration_sec":    len(frames) / fps,
    }
    return features


def _estimate_cadence(left_y: np.ndarray, right_y: np.ndarray, fps: float) -> float:
    """
    Very lightweight cadence estimator: counts zero-crossings of the
    detrended ankle vertical signal (each crossing ≈ one heel strike).
    Returns steps per second.
    """
    combined = np.concatenate([left_y, right_y])
    detrended = combined - combined.mean()
    # Count sign changes
    sign_changes = np.where(np.diff(np.sign(detrended)))[0]
    # Each full cycle = 2 sign changes = 1 step
    n_steps = len(sign_changes) / 2
    duration = len(left_y) / fps
    return float(n_steps / duration) if duration > 0 else 0.0
