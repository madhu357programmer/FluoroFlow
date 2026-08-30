"""
database.py
SQLite connection and schema setup for FluoroFlow.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fluoroflow.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS samples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sample_name TEXT NOT NULL,
            location TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            original_image_path TEXT,
            processed_image_path TEXT,
            detected_image_path TEXT,
            particle_count INTEGER,
            avg_particle_size REAL,
            confidence_score REAL,
            contamination_level TEXT,
            contamination_score INTEGER,
            filtration_mode TEXT,
            is_demo INTEGER DEFAULT 0
        )
        """
    )
    conn.commit()
    conn.close()


def insert_sample(record: dict) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO samples (
            sample_name, location, timestamp,
            original_image_path, processed_image_path, detected_image_path,
            particle_count, avg_particle_size, confidence_score,
            contamination_level, contamination_score, filtration_mode, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            record["sample_name"],
            record["location"],
            record["timestamp"],
            record["original_image_path"],
            record["processed_image_path"],
            record["detected_image_path"],
            record["particle_count"],
            record["avg_particle_size"],
            record["confidence_score"],
            record["contamination_level"],
            record["contamination_score"],
            record["filtration_mode"],
            record.get("is_demo", 0),
        ),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id


def get_all_samples():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM samples ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_sample_by_id(sample_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM samples WHERE id = ?", (sample_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
