"""
contamination.py

Transparent, configurable contamination scoring + adaptive
filtration recommendation logic.
"""

# ---- Configurable thresholds ----
LOW_MAX = 10        # 0-10 particles -> LOW
MEDIUM_MAX = 30      # 11-30 particles -> MEDIUM
                      # >30 particles -> HIGH


def classify_contamination(particle_count: int) -> dict:
    """
    Returns a dict with:
        level: "LOW" | "MEDIUM" | "HIGH"
        score: 0-100 transparency score (just a normalized particle count)
        filtration_mode: recommended action string
        hardware_note: label clarifying this is a simulation
    """
    if particle_count <= LOW_MAX:
        level = "LOW"
        filtration_mode = "Normal Filtration Mode"
    elif particle_count <= MEDIUM_MAX:
        level = "MEDIUM"
        filtration_mode = "Enhanced Filtration Recommended"
    else:
        level = "HIGH"
        filtration_mode = "Intensive Filtration Recommended - Alert Generated"

    # Simple transparent score: capped percentage of the "HIGH" boundary
    score = min(100, int((particle_count / (MEDIUM_MAX + 1)) * 100))

    return {
        "contamination_level": level,
        "contamination_score": score,
        "filtration_mode": filtration_mode,
        "hardware_note": "Hardware Control Simulation",
    }
