# FluoroFlow

AI-Assisted Microplastic Detection & Adaptive Water Filtration — hackathon MVP.

FluoroFlow lets you upload a water sample image, runs it through a real
OpenCV particle-detection pipeline (proof-of-concept screening, not a
lab-grade classifier), classifies contamination level, and simulates an
adaptive filtration response. A Demo Mode reliably generates LOW / MEDIUM /
HIGH contamination results for presentations, using the same detection
pipeline on a synthetically generated sample image.

**Disclaimer shown throughout the UI:** *AI-assisted suspected microplastic
screening — laboratory confirmation may be required.*

---

## 1. Requirements

- Python 3.10+ (3.11 recommended)
- Node.js 18+ and npm
- Windows PowerShell (or macOS/Linux terminal — commands noted below)

No API keys, no cloud services, no paid APIs are required.

---

## 2. Unzip the project

1. Download `fluoroflow.zip`.
2. Right-click the zip file → **Extract All...** → choose a destination folder (e.g. `Documents\fluoroflow`) → **Extract**.
   - Or in PowerShell:
     ```powershell
     Expand-Archive -Path fluoroflow.zip -DestinationPath fluoroflow
     ```
3. Open the extracted `fluoroflow` folder. You should see `backend/`, `frontend/`, and this `README.md`.

---

## 3. Backend setup (FastAPI + OpenCV)

Open a terminal in the project root (`fluoroflow/`):

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**macOS/Linux equivalent:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend starts at **http://localhost:8000**.
Verify it's running: open http://localhost:8000/api/health in a browser — you should see `{"status":"ok", ...}`.

A `fluoroflow.db` SQLite file and an `uploads/` folder are created automatically on first run.

---

## 4. Frontend setup (React + Vite)

Open a **second** terminal (keep the backend running) in the project root:

```powershell
cd frontend
npm install
npm run dev
```

The frontend starts at **http://localhost:5173**. Open that URL in your browser.

CORS is already configured in `backend/main.py` to allow requests from `http://localhost:5173`.

---

## 5. Using the app

1. **Dashboard** — overview stats + Demo Mode buttons (Low / Medium / High).
2. **Analyze Sample** — upload a real image, enter a sample name and location, click **Analyze Sample**.
3. **Analysis Result** — shows original / processed / detected images, particle count, size, confidence, contamination level, and the filtration recommendation.
4. **History** — every analysis (real + demo) is stored in SQLite; click any row to revisit its result.
5. **System Architecture** — current MVP vs. future hardware roadmap.

**For hackathon judging:** use the three Demo Mode buttons on the Dashboard to reliably show all three contamination levels without needing a real water sample image.

---

## 6. Project structure

```
fluoroflow/
├── backend/
│   ├── main.py              # FastAPI app, routes, CORS
│   ├── database.py          # SQLite connection + schema
│   ├── models.py            # Pydantic response schemas
│   ├── image_processor.py   # OpenCV detection pipeline
│   ├── contamination.py     # Scoring + filtration logic (thresholds here)
│   ├── demo_generator.py    # Synthetic sample generator for Demo Mode
│   ├── requirements.txt
│   └── uploads/              # original/processed/detected images (runtime)
├── frontend/
│   ├── src/
│   │   ├── main.jsx / App.jsx / api.js / index.css
│   │   ├── components/      # NavBar, StatCard, ContaminationBadge, FiltrationCard, ImageCompare, DemoButtons
│   │   └── pages/            # Dashboard, AnalyzeSample, AnalysisResult, History, Architecture
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 7. Configuring contamination thresholds

Edit `backend/contamination.py`:

```python
LOW_MAX = 10       # 0-10 particles -> LOW
MEDIUM_MAX = 30     # 11-30 particles -> MEDIUM
                     # above MEDIUM_MAX -> HIGH
```

Detection sensitivity (min/max particle area, brightness threshold) is configurable at the top of `backend/image_processor.py`.

---

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| `ModuleNotFoundError` on backend start | Make sure the virtual environment is activated (`venv\Scripts\activate`) before `pip install`. |
| Frontend shows "Backend not reachable" | Confirm `uvicorn main:app --reload` is running on port 8000 and no firewall is blocking `localhost`. |
| CORS error in browser console | Confirm the frontend is running on `http://localhost:5173` exactly — that's the only origin whitelisted in `main.py`. |
| Images don't load on the Result page | Confirm the backend is still running — images are served from `http://localhost:8000/uploads/...`. |
| `cv2` import error | Re-run `pip install -r requirements.txt` inside the activated venv; `opencv-python-headless` is required (not `opencv-python`) on headless machines. |

---

## 9. Deployment (optional, beyond hackathon local demo)

This MVP is built to run locally for the hackathon. If you want to deploy it beyond your laptop:

**Backend (FastAPI):** deploy to any Python host that supports long-running processes (Render, Railway, Fly.io, a VPS). Run with:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
Note: SQLite is file-based — on ephemeral hosts (like some free tiers) the database and uploaded images will reset on redeploy. For persistence, mount a persistent volume or migrate to a hosted Postgres later.

**Frontend (React/Vite):** run `npm run build` inside `frontend/` to produce a static `dist/` folder, then deploy that folder to Vercel, Netlify, or GitHub Pages.

**Connect them:** after deploying the backend, update the `API_BASE` constant in `frontend/src/api.js` to your backend's public URL, and add that frontend's deployed URL to the `allow_origins` list in `backend/main.py`. Rebuild the frontend after changing `API_BASE`.

This step is optional — for hackathon demo purposes, running both servers locally (Sections 3–4) is enough.

---

## 10. Important notes

- This is a **proof-of-concept screening system**. It does not scientifically confirm that every detected particle is a microplastic — it flags bright, particle-shaped regions consistent with what fluorescent-stained microplastics would look like under UV/blue light.
- The filtration response is a **software simulation**. No physical pump, valve, Raspberry Pi, or ESP32 is controlled by this MVP.

  ## 11. Potential Scope
  - FluoroFlow can be extended into a real-time microplastic screening system by integrating continuous camera capture with lightweight AI inference on an edge device such as Raspberry Pi. Real-time frame processing, optimized models, and controlled illumination can enable faster particle detection and contamination-level estimation. The output can then be linked with the ESP32 control system to support automatic, contamination-based filtration, moving FluoroFlow toward continuous field monitoring and adaptive water treatment.
