"""
demo_generator.py

Generates a synthetic "water sample under UV/blue light" image with a
controlled number of bright particle-like blobs, so the real OpenCV
pipeline (image_processor.py) can reliably demonstrate LOW / MEDIUM /
HIGH contamination results even without physical hardware.

This is NOT fake output data - the generated image is genuinely run
through the same detection pipeline used for real uploads.
"""

import cv2
import numpy as np
import random
import os

DEMO_PARTICLE_RANGES = {
    "low": (4, 9),
    "medium": (14, 26),
    "high": (34, 55),
}

IMG_SIZE = 640


def generate_demo_image(level: str, save_dir: str, base_name: str) -> str:
    level = level.lower()
    if level not in DEMO_PARTICLE_RANGES:
        raise ValueError("level must be one of: low, medium, high")

    os.makedirs(save_dir, exist_ok=True)

    # Dark background simulating water under UV/blue illumination
    img = np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.uint8)
    img[:, :, 0] = np.random.randint(8, 22, (IMG_SIZE, IMG_SIZE))   # slight blue tint
    img[:, :, 1] = np.random.randint(5, 15, (IMG_SIZE, IMG_SIZE))
    img[:, :, 2] = np.random.randint(0, 8, (IMG_SIZE, IMG_SIZE))

    # subtle background noise/texture
    noise = np.random.normal(0, 4, img.shape).astype(np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    low, high = DEMO_PARTICLE_RANGES[level]
    n_particles = random.randint(low, high)

    for _ in range(n_particles):
        cx = random.randint(30, IMG_SIZE - 30)
        cy = random.randint(30, IMG_SIZE - 30)
        radius = random.randint(3, 9)
        brightness = random.randint(200, 255)
        color = (brightness, brightness, int(brightness * 0.9))
        cv2.circle(img, (cx, cy), radius, color, -1)

    # slight blur so particles look like glowing blobs, not hard-edged circles
    img = cv2.GaussianBlur(img, (5, 5), 0)

    image_path = os.path.join(save_dir, f"{base_name}_demo_source.png")
    cv2.imwrite(image_path, img)
    return image_path
