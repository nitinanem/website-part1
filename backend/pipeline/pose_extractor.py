"""
pose_extractor.py
-----------------
MediaPipe 1.x Tasks API (PoseLandmarker) — extracts lower-body skeletal
landmarks from a gait video. The legacy mp.solutions API was removed in
MediaPipe ≥ 0.10 / 1.x.

On first run this downloads the pose_landmarker_full.task model (~30 MB)
from the MediaPipe CDN into backend/models/.
"""

import cv2
import numpy as np
import urllib.request
import os
from pathlib import Path

import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

# ── Model download ─────────────────────────────────────────────────────────────
MODEL_DIR   = Path(__file__).parent.parent / "models"
MODEL_PATH  = MODEL_DIR / "pose_landmarker_full.task"
MODEL_URL   = (
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/"
    "pose_landmarker_full/float16/latest/pose_landmarker_full.task"
)

def _ensure_model() -> str:
    MODEL_DIR.mkdir(exist_ok=True)
    if not MODEL_PATH.exists():
        print(f"[pose_extractor] Downloading MediaPipe pose model to {MODEL_PATH} …")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("[pose_extractor] Download complete.")
    return str(MODEL_PATH)


# ── Landmark indices we care about (MediaPipe 33-point body schema) ────────────
LOWER_BODY_LANDMARKS = {
    "left_hip":         23,
    "right_hip":        24,
    "left_knee":        25,
    "right_knee":       26,
    "left_ankle":       27,
    "right_ankle":      28,
    "left_heel":        29,
    "right_heel":       30,
    "left_foot_index":  31,
    "right_foot_index": 32,
}


def extract_landmarks_from_video(video_path: str) -> list[dict]:
    """
    Process every frame of a gait video and extract normalised 3-D landmark
    coordinates using the MediaPipe 1.x PoseLandmarker Tasks API.

    Returns:
        A list of per-frame landmark dicts.
    """
    if not Path(video_path).exists():
        raise FileNotFoundError(f"Video not found: {video_path}")

    model_path = _ensure_model()

    # Build the Tasks-API options
    base_options = mp_python.BaseOptions(model_asset_path=model_path)
    options = mp_vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=mp_vision.RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frames_data = []

    with mp_vision.PoseLandmarker.create_from_options(options) as landmarker:
        frame_idx = 0
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            # Convert to RGB and wrap in MediaPipe Image
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

            # Timestamp in milliseconds
            timestamp_ms = int((frame_idx / fps) * 1000)
            result = landmarker.detect_for_video(mp_image, timestamp_ms)

            if result.pose_landmarks:
                lm = result.pose_landmarks[0]   # first (and only) detected pose
                frame_landmarks = {}
                for name, idx in LOWER_BODY_LANDMARKS.items():
                    kp = lm[idx]
                    frame_landmarks[name] = {
                        "x":          kp.x,
                        "y":          kp.y,
                        "z":          kp.z,
                        "visibility": kp.visibility,
                    }
                frames_data.append({
                    "frame":     frame_idx,
                    "fps":       fps,
                    "landmarks": frame_landmarks,
                })

            frame_idx += 1

    cap.release()
    return frames_data


def _angle_between(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """Calculate the angle at point B formed by vectors BA and BC (degrees)."""
    ba = a - b
    bc = c - b
    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-9)
    cosine = np.clip(cosine, -1.0, 1.0)
    return float(np.degrees(np.arccos(cosine)))


def compute_joint_angles(frame: dict) -> dict:
    """
    Compute left and right knee flexion angles for a single frame.
    Returns dict with 'left_knee_angle' and 'right_knee_angle' in degrees.
    """
    lm = frame["landmarks"]

    def to_arr(name: str) -> np.ndarray:
        p = lm[name]
        return np.array([p["x"], p["y"], p["z"]])

    left_angle  = _angle_between(to_arr("left_hip"),  to_arr("left_knee"),  to_arr("left_ankle"))
    right_angle = _angle_between(to_arr("right_hip"), to_arr("right_knee"), to_arr("right_ankle"))
    return {"left_knee_angle": left_angle, "right_knee_angle": right_angle}
