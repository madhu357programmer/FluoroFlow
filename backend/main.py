"""
main.py
FluoroFlow FastAPI backend entrypoint.
"""

import os
import shutil
import uuid
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db, insert_sample, get_all_samples, get_sample_by_id
from image_processor import process_image
from contamination import classify_contamination
from demo_generator import generate_demo_image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="FluoroFlow API", version="1.0.0")

# ---- CORS: allow the Vite dev server to talk to this API ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://fluoro-flow.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Serve uploaded/processed images statically ----
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

init_db()


def _to_url(path: str) -> str:
    """Convert an absolute file path under uploads/ into a URL the frontend can load."""
    if not path:
        return ""
    filename = os.path.basename(path)
    return f"/uploads/{filename}"


def _record_to_response(record: dict) -> dict:
    return {
        "id": record["id"],
        "sample_name": record["sample_name"],
        "location": record["location"],
        "timestamp": record["timestamp"],
        "original_image_url": _to_url(record["original_image_path"]),
        "processed_image_url": _to_url(record["processed_image_path"]),
        "detected_image_url": _to_url(record["detected_image_path"]),
        "particle_count": record["particle_count"],
        "avg_particle_size": record["avg_particle_size"],
        "confidence_score": record["confidence_score"],
        "contamination_level": record["contamination_level"],
        "contamination_score": record["contamination_score"],
        "filtration_mode": record["filtration_mode"],
        "is_demo": bool(record["is_demo"]),
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "FluoroFlow backend is running"}


@app.post("/api/analyze")
async def analyze_sample(
    sample_name: str = Form(...),
    location: str = Form(...),
    file: UploadFile = File(...),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    unique_id = uuid.uuid4().hex[:8]
    base_name = f"{unique_id}"
    original_ext = os.path.splitext(file.filename)[1] or ".png"
    original_path = os.path.join(UPLOAD_DIR, f"{base_name}_original{original_ext}")

    with open(original_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = process_image(original_path, UPLOAD_DIR, base_name)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {exc}")

    classification = classify_contamination(result["particle_count"])

    record = {
        "sample_name": sample_name,
        "location": location,
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "original_image_path": original_path,
        "processed_image_path": result["processed_image_path"],
        "detected_image_path": result["detected_image_path"],
        "particle_count": result["particle_count"],
        "avg_particle_size": result["avg_particle_size"],
        "confidence_score": result["confidence_score"],
        "contamination_level": classification["contamination_level"],
        "contamination_score": classification["contamination_score"],
        "filtration_mode": classification["filtration_mode"],
        "is_demo": 0,
    }

    new_id = insert_sample(record)
    saved = get_sample_by_id(new_id)
    return _record_to_response(saved)


@app.post("/api/demo/{level}")
async def run_demo(level: str):
    level = level.lower()
    if level not in ("low", "medium", "high"):
        raise HTTPException(status_code=400, detail="level must be low, medium, or high")

    unique_id = uuid.uuid4().hex[:8]
    base_name = f"demo_{level}_{unique_id}"

    source_path = generate_demo_image(level, UPLOAD_DIR, base_name)

    try:
        result = process_image(source_path, UPLOAD_DIR, base_name)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Demo processing failed: {exc}")

    classification = classify_contamination(result["particle_count"])

    record = {
        "sample_name": f"Demo Sample ({level.upper()})",
        "location": "Simulated Field Sensor",
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "original_image_path": source_path,
        "processed_image_path": result["processed_image_path"],
        "detected_image_path": result["detected_image_path"],
        "particle_count": result["particle_count"],
        "avg_particle_size": result["avg_particle_size"],
        "confidence_score": result["confidence_score"],
        "contamination_level": classification["contamination_level"],
        "contamination_score": classification["contamination_score"],
        "filtration_mode": classification["filtration_mode"],
        "is_demo": 1,
    }

    new_id = insert_sample(record)
    saved = get_sample_by_id(new_id)
    return _record_to_response(saved)


@app.get("/api/history")
def history():
    samples = get_all_samples()
    return [
        {
            "id": s["id"],
            "sample_name": s["sample_name"],
            "location": s["location"],
            "timestamp": s["timestamp"],
            "particle_count": s["particle_count"],
            "contamination_level": s["contamination_level"],
            "filtration_mode": s["filtration_mode"],
            "is_demo": bool(s["is_demo"]),
        }
        for s in samples
    ]


@app.get("/api/history/{sample_id}")
def history_item(sample_id: int):
    record = get_sample_by_id(sample_id)
    if not record:
        raise HTTPException(status_code=404, detail="Sample not found")
    return _record_to_response(record)
