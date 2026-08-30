"""
models.py
Pydantic schemas used for API responses.
"""

from pydantic import BaseModel
from typing import Optional


class SampleSummary(BaseModel):
    id: int
    sample_name: str
    location: str
    timestamp: str
    particle_count: int
    contamination_level: str
    filtration_mode: str
    is_demo: int


class SampleDetail(BaseModel):
    id: int
    sample_name: str
    location: str
    timestamp: str
    original_image_path: Optional[str]
    processed_image_path: Optional[str]
    detected_image_path: Optional[str]
    particle_count: int
    avg_particle_size: float
    confidence_score: float
    contamination_level: str
    contamination_score: int
    filtration_mode: str
    is_demo: int


class HealthResponse(BaseModel):
    status: str
    message: str
