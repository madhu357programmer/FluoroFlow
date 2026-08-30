"""
image_processor.py

Proof-of-concept OpenCV pipeline for suspected microplastic particle
detection from a water sample image.

This is a SCREENING heuristic, not a scientifically validated
microplastic classifier. It looks for small, bright, roughly-circular
blobs against a darker background (simulating how particles would
fluoresce under UV/blue light after staining in the full hardware
version of FluoroFlow), and reports them as "suspected particles".

Pipeline:
1. Load image
2. Convert to HSV
3. Threshold the brightness (V) channel adaptively
4. Morphological cleanup (open + close) to reduce noise
5. Find contours
6. Filter by area (MIN_PARTICLE_AREA / MAX_PARTICLE_AREA)
7. Estimate particle size (equivalent diameter in pixels)
8. Estimate a confidence score from contour circularity
9. Draw annotated output image
"""

import cv2
import numpy as np
import os

# ---- Configurable detection parameters ----
MIN_PARTICLE_AREA = 6        # px^2, filters out single-pixel noise
MAX_PARTICLE_AREA = 4000     # px^2, filters out huge blobs / whole regions
BRIGHTNESS_STD_MULTIPLIER = 1.4  # how far above mean brightness counts as "bright"
MORPH_KERNEL_SIZE = 3


def _ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def process_image(image_path: str, save_dir: str, base_name: str) -> dict:
    """
    Runs the full detection pipeline on an image and saves the
    processed (mask) image and the detected (annotated) image to disk.

    Returns a dict with:
        processed_image_path, detected_image_path,
        particle_count, avg_particle_size, confidence_score
    """
    _ensure_dir(save_dir)

    original = cv2.imread(image_path)
    if original is None:
        raise ValueError(f"Could not read image at {image_path}")

    # Resize very large images for consistent, fast processing
    h, w = original.shape[:2]
    max_dim = 900
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        original = cv2.resize(original, (int(w * scale), int(h * scale)))

    # 1. HSV conversion
    hsv = cv2.cvtColor(original, cv2.COLOR_BGR2HSV)
    v_channel = hsv[:, :, 2]

    # 2. Adaptive brightness threshold
    mean_v = float(np.mean(v_channel))
    std_v = float(np.std(v_channel))
    threshold_value = min(250, mean_v + BRIGHTNESS_STD_MULTIPLIER * std_v)
    _, mask = cv2.threshold(v_channel, threshold_value, 255, cv2.THRESH_BINARY)

    # 3. Morphological cleanup
    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (MORPH_KERNEL_SIZE, MORPH_KERNEL_SIZE)
    )
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    # 4. Contours
    contours, _ = cv2.findContours(
        mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    detected_image = original.copy()
    particle_sizes = []
    circularity_scores = []

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < MIN_PARTICLE_AREA or area > MAX_PARTICLE_AREA:
            continue

        perimeter = cv2.arcLength(cnt, True)
        if perimeter == 0:
            continue

        # Circularity: 1.0 = perfect circle
        circularity = float(4 * np.pi * area / (perimeter ** 2))
        circularity = max(0.0, min(circularity, 1.0))

        # Equivalent diameter in pixels
        diameter_px = float(np.sqrt(4 * area / np.pi))

        (cx, cy), radius = cv2.minEnclosingCircle(cnt)
        center = (int(cx), int(cy))
        radius = max(int(radius), 3)

        cv2.circle(detected_image, center, radius, (0, 140, 255), 2)
        cv2.circle(detected_image, center, 2, (0, 0, 255), -1)

        particle_sizes.append(diameter_px)
        circularity_scores.append(circularity)

    particle_count = len(particle_sizes)
    avg_particle_size = float(np.mean(particle_sizes)) if particle_sizes else 0.0

    if circularity_scores:
        confidence_score = round(float(np.mean(circularity_scores)) * 100, 1)
    else:
        confidence_score = 0.0

    # Label the annotated image
    label = f"Suspected particles: {particle_count}"
    cv2.putText(
        detected_image, label, (10, 25),
        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA
    )

    # Save processed (mask) image as a viewable BGR image
    processed_visual = cv2.cvtColor(mask.astype(np.uint8), cv2.COLOR_GRAY2BGR)

    processed_image_path = os.path.join(save_dir, f"{base_name}_processed.png")
    detected_image_path = os.path.join(save_dir, f"{base_name}_detected.png")

    cv2.imwrite(processed_image_path, processed_visual)
    cv2.imwrite(detected_image_path, detected_image)

    return {
        "processed_image_path": processed_image_path,
        "detected_image_path": detected_image_path,
        "particle_count": particle_count,
        "avg_particle_size": round(avg_particle_size, 2),
        "confidence_score": confidence_score,
    }
