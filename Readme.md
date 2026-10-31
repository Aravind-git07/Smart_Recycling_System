# AI-Based Smart Recycling System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg?logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg?logo=vercel&logoColor=white)](https://smart-recycling-system-snowy.vercel.app)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7.svg?logo=render&logoColor=black)](https://smart-recycling-system-isn1.onrender.com)

An intelligent, full-stack waste-management software application designed to classify waste items, guide responsible disposal, prevent recycling contamination, and provide analytics on material segregation.

Built as an academic engineering project demonstrating clean architecture, resilient AI services, dynamic database-backed dashboards, and domain-grounded recycling intelligence.

---

## 🌐 Live Production Deployments

| Component | Platform | Live URL / Access | Status |
|---|---|---|---|
| **Frontend Web App** | Vercel (Global Edge CDN) | [https://smart-recycling-system-snowy.vercel.app](https://smart-recycling-system-snowy.vercel.app) | 🟢 Live & Production Ready |
| **Backend API** | Render (Cloud Web Service) | [https://smart-recycling-system-isn1.onrender.com](https://smart-recycling-system-isn1.onrender.com) | 🟢 Active (FastAPI ASGI) |
| **Interactive API Docs** | Render Swagger UI | [https://smart-recycling-system-isn1.onrender.com/docs](https://smart-recycling-system-isn1.onrender.com/docs) | 🟢 Live OpenAPI / Swagger |
| **Source Repository** | GitHub | [https://github.com/Aravind-git07/Smart_Recycling_System](https://github.com/Aravind-git07/Smart_Recycling_System) | 🟢 Main Branch Synchronized |

> [!TIP]
> **Mobile Camera Demonstration:** The live web app works directly on smartphone browsers (Chrome / Safari / Firefox). Tapping **"📸 Take Photo"** triggers the device's native rear camera (`capture="environment"`), while laptop users can use the in-browser **Live Webcam Viewfinder** or **Quick Samples** for instant testing.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Multi-Tier Resilient AI Architecture](#3-multi-tier-resilient-ai-architecture)
4. [System Architecture](#4-system-architecture)
5. [Data Flow Pipeline](#5-data-flow-pipeline)
6. [Tech Stack & Dependencies](#6-tech-stack--dependencies)
7. [Folder Structure](#7-folder-structure)
8. [Installation & Setup (Local Development)](#8-installation--setup-local-development)
9. [Running the Application Locally](#9-running-the-application-locally)
10. [Cloud Deployment Architecture (Vercel + Render)](#10-cloud-deployment-architecture-vercel--render)
11. [API Endpoints Reference](#11-api-endpoints-reference)
12. [Database Design](#12-database-design)
13. [Testing & Verification](#13-testing--verification)
14. [College Viva & Presentation Defense Notes](#14-college-viva--presentation-defense-notes)

---

## 1. Project Overview

Municipal solid waste recycling frequently suffers from high contamination rates (up to 30% in single-stream processing facilities). In most cases, contamination happens not from malice, but because consumers lack accessible, item-specific instructions on how to prepare and segregate recyclable items (e.g. throwing greasy pizza boxes into paper bins or putting aerosol cans in general trash).

The **AI-Based Smart Recycling System** bridges this gap:
- **Vision Classification:** Automatically identifies waste items from real camera photos across eight primary streams: **Plastic, Paper, Cardboard, Glass, Metal, Organic, E-Waste, and General Waste**.
- **Dual-Mode Resilient AI Architecture:** Combines live multimodal cloud inference (Google Gemini 2.0 Flash / 1.5 Flash Vision) with a balanced, score-based offline Computer Vision (CV) Feature Engine (Pillow). The system operates seamlessly during viva demonstrations even under zero internet connectivity or API quota exhaustion.
- **Actionable Guidance:** Instead of outputting a simple label, the platform provides step-by-step preparation checklists (rinsing, crushing, label peeling), upcycling ideas, contamination warnings, safety cautions, and municipal regulation notes.
- **Mobile First & Webcam Support:** Features direct rear-facing camera capture on mobile phones and a live viewfinder modal for laptop webcam demonstrations.
- **Manual Failover:** Allows users to manually select materials to receive identical verified recommendations when camera conditions are poor or lighting is obscured.
- **Dynamic Database Analytics:** Computes dashboard metrics and charts directly from an ACID-compliant SQLite database.

---

## 2. Key Features

### A. Mobile Camera & Live Image Capture
- **Native Rear-Facing Camera Trigger:** HTML5 `<input type="file" accept="image/*" capture="environment">` launches the mobile device's camera in 1 tap.
- **Live In-Browser Webcam Viewfinder:** Allows laptop and desktop users to capture real-world waste items directly via their webcam during in-person viva demonstrations.
- **Universal Mobile File Support:** Forgiving file validation supporting all mobile camera image types (`image/*`, `.jpg`, `.png`, `.heic`, `.webp`, `.bmp`).
- **1-Click Viva Quick Test Samples:** Instant sample buttons for evaluating typical items (Plastic Bottle, Cardboard Box, Newspaper, Metal Can, Glass Jar, Apple Core, Broken Charger) without needing physical waste on hand.

### B. Intelligent AI Waste Classification
- **Automatic Smartphone Image Optimization:** Automatically downsamples heavy camera captures (6 MB – 15 MB) to 1024x1024 (< 300 KB) using Lanczos filtering before sending to Gemini, preventing Google's 4 MB inline payload limit rejection.
- **Dynamic Google Gemini Model Discovery:** Queries Google's `v1beta/models` endpoint dynamically to inspect which Gemini vision models are active on the connected API key, eliminating 404 Model Not Found errors.
- **Multi-Model Fallback Sequence:** Cascades across `gemini-2.0-flash`, `gemini-1.5-flash-latest`, `gemini-1.5-flash-002`, `gemini-1.5-flash-001`, and `gemini-1.5-flash`.
- **Score-Based Built-in CV Heuristic Engine:** Offline multi-factor visual analysis based on HSV hue, color saturation, luminance, specular metallic/glass highlights, aspect ratio, and edge density.
- **Realistic Confidence Scores:** Calibrated scores between 75% and 96%, avoiding fabricated 99.9% values.
- **Transparent AI Visual Features:** Explains the exact optical and geometric traits detected by the model.

### C. Comprehensive Circular Economy Recommendations
- **Disposal Stream & Bin Color:** Clear assignment to standard bin colors (Blue for Paper/Cardboard, Yellow for Clean Plastics/Metals, Green for Organics, Red/Specialist for E-Waste, Grey/Black for Landfill).
- **Interactive Preparation Steps:** Checkbox-driven instructions for cleaning, rinsing, removing tape/caps, and flattening.
- **Upcycling & Reuse Ideas:** Practical ideas to extend product lifespans before disposal.
- **Contamination Safeguards:** Explains why greasy pizza boxes, soft plastic films, or ceramic mugs ruin industrial recycling batches.
- **Safety Precautions:** Clear hazard warnings for sharp edges, battery thermal runaway, and toxic fumes from burning plastics.
- **Local Municipality Notes:** Regional municipal dependency notes (e.g. #1 PET vs #6 Polystyrene acceptance, bottle deposit schemes).

### D. Manual Waste Selection Fallback
- Direct selection across 8 standardized waste categories.
- Optional custom item naming (e.g., "500ml Pickle Jar") and user condition notes.
- Distinctly tags records with `method: manual` in the database for transparent auditing.

### E. Real-Time Recycling Analytics Dashboard
- **Total Classification Volume:** Dynamically queried from stored records.
- **AI vs. Manual Ratio:** Visualized with an interactive distribution bar.
- **Category-Wise Breakdown:** Visual bar meters showing proportions of each waste category.
- **Recyclability Potential:** Segregation of items by High, Moderate, Low, or Non-Recyclable ratings.
- **7-Day Activity Volume:** Real-time day-by-day frequency histogram.
- **Recent Activity Table:** Shows the latest logged items with category badges and timestamps.

### F. Searchable Classification History & Audit Log
- Searchable by item name, material category, or notes.
- Filterable by material category and classification method.
- Detailed modal viewer with complete preparation checklists and contamination notes.
- Individual record deletion and bulk history clear options with storage cleanup.

### G. Segregation Guidelines & Viva Knowledge Reference
- Standard 4-Tier Waste Hierarchy (Refuse & Reduce > Reuse & Repair > Recycle & Compost > Responsible Disposal).
- 3-Way Source Segregation Framework (Wet Waste, Dry Recyclables, Domestic Hazardous / E-Waste).
- Common Contamination Traps (oily paper, mixed composites, bio-plastics).

---

## 3. Multi-Tier Resilient AI Architecture

A frequent issue with student AI projects is fragility during college reviews: API keys expire, cloud quotas exceed, or camera images fail to transmit. The **AI-Based Smart Recycling System** is engineered with a **3-Tier Resilient Architecture**:

```
[User Image: Mobile Camera / File / Webcam]
                    │
                    ▼
       ┌────────────────────────┐
       │ Image Preprocessing    │
       │ - EXIF orientation fix │
       │ - 1024x1024 downsample │ (< 300 KB, prevents 4MB Google limit)
       └───────────┬────────────┘
                   │
         Is GEMINI_API_KEY set?
                   │
         ├─── YES ─┴───────────────────────────────┐
         │                                         │
         ▼                                         ▼
┌─────────────────────────────────┐       ┌──────────────────────────────┐
│ Tier 1: Cloud Gemini Vision AI  │       │ Tier 2: Built-in CV Engine   │
│ - Dynamic Model Discovery       │ FAIL  │ - Center-cropped HSV Hue     │
│   (v1beta/models lookup)        │──────>│ - Saturation & Luminance     │
│ - Multi-Model Fallback:         │       │ - Specular Highlight Ratio   │
│   gemini-2.0-flash              │       │ - Edge Density Complexity    │
│   gemini-1.5-flash-latest       │       │ - Elongation Aspect Ratio    │
│   gemini-1.5-flash              │       │ (100% Offline & Deterministic)
└────────────────┬────────────────┘       └──────────────┬───────────────┘
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │ Recommendation Knowledge    │
                      │ Base & Storage (SQLite DB)  │
                      └─────────────────────────────┘
                                     ▲
                                     │ User Failover
                      ┌──────────────┴──────────────┐
                      │ Tier 3: Manual Selection    │
                      │ (Select 1 of 8 Categories)  │
                      └─────────────────────────────┘
```

### Why Did Earlier Google Gemini Requests Fail, and How Was It Resolved?
During deployment and testing with Google AI Studio Free Tier keys (`EcoSort-AI-Key`), two distinct cloud failure modes occurred:

1. **Google Gemini REST Error (404) - Model Not Found:**
   - *Root Cause:* Static model names like `models/gemini-1.5-flash` are not uniformly exposed across all Google AI Studio project tiers under the `v1beta` endpoint; some projects only permit `gemini-2.0-flash` or `gemini-1.5-flash-latest`.
   - *Fix Implemented:* Built **Dynamic Model Discovery (`discover_available_gemini_models`)**, which queries `https://generativelanguage.googleapis.com/v1beta/models?key=KEY` at runtime. The backend automatically selects the active supported models and falls back through a priority list (`gemini-2.0-flash` → `gemini-1.5-flash-latest` → `gemini-1.5-flash`).

2. **Google Gemini Payload Size Exceeded (HTTP 400):**
   - *Root Cause:* Smartphone cameras capture high-resolution photos ranging from 6 MB to 15 MB. Google Gemini's REST API has a strict 4 MB inline base64 payload limit.
   - *Fix Implemented:* Integrated Pillow Lanczos downsampling before transmission. Every image is resized to at most 1024x1024 with 85% JPEG optimization, reducing payload sizes to ~150–280 KB while preserving fine visual texture details.

3. **Graceful Fallback to Score-Based CV Engine:**
   - If the API key is absent, rate-limited (15 requests/min on free tier), or the network drops, the backend automatically transitions to the built-in score-based CV engine and flags the UI badge accordingly (`⚙️ Built-in CV Engine`), guaranteeing zero crashes during presentations.

---

## 4. System Architecture

```mermaid
graph TD
    subgraph Client ["Client Layer (Vercel Edge)"]
        Browser["React 18 Single Page App"]
        CamTrigger["Mobile Camera / Webcam / File Picker"]
    end

    subgraph BackendService ["Backend Layer (Render Web Service)"]
        FastAPIServer["FastAPI ASGI Server (:8000)"]
        RouterClassify["/api/classify & /api/manual-select"]
        RouterHistory["/api/history"]
        RouterDashboard["/api/dashboard/stats"]
        RouterCategories["/api/categories & /api/guidelines"]
        
        ClassifierService["AI Classifier Service"]
        RecEngine["Recommendation Knowledge Engine"]
        StatService["Statistics Aggregation Service"]
    end

    subgraph ExternalCloud ["External AI Services"]
        GeminiAPI["Google Gemini Vision API (v1beta REST / SDK)"]
    end

    subgraph Persistence ["Persistence Layer"]
        SQLiteDB[("SQLite Database: recycling_system.db")]
        UploadsDir["Uploaded Images (/uploads)"]
    end

    CamTrigger --> Browser
    Browser -->|HTTPS REST / JSON| FastAPIServer
    
    FastAPIServer --> RouterClassify
    FastAPIServer --> RouterHistory
    FastAPIServer --> RouterDashboard
    FastAPIServer --> RouterCategories
    
    RouterClassify --> ClassifierService
    ClassifierService -->|Cloud Tier| GeminiAPI
    ClassifierService -->|Offline Tier| RecEngine
    RouterClassify --> RecEngine
    
    RouterClassify --> SQLiteDB
    RouterHistory --> SQLiteDB
    RouterDashboard --> SQLiteDB
    RouterClassify --> UploadsDir
```

---

## 5. Data Flow Pipeline

1. **Capture & Preprocessing:** The user captures a photo via smartphone camera, webcam, or drag-and-drop. The frontend sends a multipart form request to `/api/classify`.
2. **File Validation:** FastAPI validates file integrity, file size (under 10 MB), and extension.
3. **Pillow Verification & EXIF Correction:** The backend verifies image bytes with `Image.open().verify()` and applies `ImageOps.exif_transpose()` to ensure portrait phone photos are upright.
4. **Cloud Inference with Downsampling:** The image is compressed to under 300 KB and dispatched to Google Gemini Vision.
5. **Fallback Safety Net:** If Gemini returns a network error, rate limit, or model error, the built-in score-based CV engine analyzes center-cropped color channels, specular highlights, and edge density.
6. **Recommendation Synthesis:** The normalized category is matched against `recommendation_engine.py` to compile tailored preparation steps, disposal streams, reuse ideas, and contamination rules.
7. **Database Logging:** The classification record, confidence score, features, and image path are committed to `recycling_system.db`.
8. **Client Visualization:** The frontend renders `RecommendationCard` with interactive checkboxes, recyclability badges, and disposal bin color tags.

---

## 6. Tech Stack & Dependencies

### Backend
- **Python 3.11+ / 3.13**
- **FastAPI 0.110+:** Modern asynchronous web framework with native OpenAPI documentation.
- **Uvicorn 0.28+:** High-performance ASGI production web server.
- **SQLAlchemy 2.0+:** Enterprise-grade Object-Relational Mapping (ORM).
- **SQLite 3:** Lightweight ACID-compliant relational database.
- **Pillow (PIL) 10.2+:** Image processing, EXIF handling, and offline CV heuristics.
- **Google GenAI SDK 0.1.1+ & Requests:** Multimodal Google Gemini REST and SDK client.
- **Pydantic 2.6+:** Strict data validation and serialization schemas.
- **python-dotenv 1.0+:** Environment variable loading.

### Frontend
- **React 18 / 19**
- **Vite 5+:** Next-generation frontend tooling and bundler.
- **Lucide React:** Modern, lightweight SVG icon system.
- **Vanilla CSS Design System:** Custom CSS variables, responsive grid/flexbox layouts, accessibility focus, clean eco-friendly design palette.

---

## 7. Folder Structure

```
Smart_Recycling_System/
│
├── backend/
│   ├── .env                       # Local environment variables
│   ├── .env.example               # Template configuration
│   ├── requirements.txt           # Python backend dependencies
│   ├── test_backend.py            # Automated test suite (6 passing tests)
│   ├── recycling_system.db        # SQLite database file
│   ├── uploads/                   # Stored user-uploaded waste images
│   ├── venv/                      # Python virtual environment
│   └── app/
│       ├── __init__.py
│       ├── main.py                # FastAPI app creation, CORS, static routes
│       ├── config.py              # Configuration & environment paths
│       ├── database.py            # SQLAlchemy engine, session maker, init_db()
│       ├── models/
│       │   ├── __init__.py
│       │   └── classification.py  # SQLAlchemy ORM table definitions
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── classification.py  # Pydantic request/response schemas
│       ├── services/
│       │   ├── ai_classifier.py   # Resilient Gemini Vision + CV engine
│       │   ├── recommendation_engine.py # 8-category knowledge base
│       │   └── statistics_service.py    # SQL aggregation analytics
│       └── api/
│           ├── routes_classify.py # /api/classify, /api/manual-select
│           ├── routes_history.py  # /api/history (GET, DELETE)
│           ├── routes_dashboard.py# /api/dashboard/stats
│           └── routes_categories.py # /api/categories, /api/guidelines
│
├── frontend/
│   ├── index.html                 # HTML entry point with Inter font
│   ├── package.json               # Node dependencies and build scripts
│   ├── vite.config.js             # Vite configuration with proxy
│   └── src/
│       ├── main.jsx               # React DOM entry point
│       ├── App.jsx                # Main layout, tab navigation, notifications
│       ├── index.css              # Custom CSS design system
│       ├── services/
│       │   └── api.js             # Fetch client & image URL resolution
│       └── components/
│           ├── Navbar.jsx         # Header, navigation tabs, health badge
│           ├── ClassificationView.jsx # File upload, dropzone, mobile camera, webcam
│           ├── RecommendationCard.jsx # Recyclability & preparation checklist
│           ├── ManualSelectionView.jsx# Category picker & custom input
│           ├── DashboardView.jsx  # Dynamic database charts & metrics
│           ├── HistoryView.jsx    # Searchable audit table & detail modal
│           └── GuidelinesView.jsx # Waste hierarchy & segregation rules
│
├── PROJECT_REVIEW_GUIDE.md        # Complete College Viva & Defense Guide
└── README.md                      # Complete system documentation
```

---

## 8. Installation & Setup (Local Development)

### Prerequisites
- **Python:** 3.10, 3.11, 3.12, or 3.13 installed (`python --version`)
- **Node.js:** v18, v20, or v22 installed (`node --version`, `npm --version`)
- **Git**

### Step 1: Clone Repository
```powershell
git clone https://github.com/Aravind-git07/Smart_Recycling_System.git
cd Smart_Recycling_System
```

### Step 2: Set Up Backend Virtual Environment
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 3: Configure Backend Environment Variables
Create a file named `.env` inside the `backend/` folder:
```env
# Optional: Google Gemini API Key for live multimodal vision
GEMINI_API_KEY=your_gemini_api_key_here

# SQLite Database Location
DATABASE_URL=sqlite:///./recycling_system.db

# Max Image Upload Size in MB
MAX_IMAGE_SIZE_MB=10
```

### Step 4: Set Up Frontend Dependencies
Open a second terminal:
```powershell
cd frontend
npm install
```

---

## 9. Running the Application Locally

### Terminal 1: Start FastAPI Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at `http://127.0.0.1:8000` (Swagger docs at `http://127.0.0.1:8000/docs`).*

### Terminal 2: Start React Frontend
```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend runs at `http://127.0.0.1:5173/`.*

---

## 10. Cloud Deployment Architecture (Vercel + Render)

The system is deployed globally across two complementary cloud platforms:

### A. Frontend Deployment on Vercel
- **Repository:** Connected to GitHub `Aravind-git07/Smart_Recycling_System` (Root directory: `frontend`).
- **Framework Preset:** Vite.
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_BASE_URL`: `https://smart-recycling-system-isn1.onrender.com` (Stored as Config).

### B. Backend Deployment on Render
- **Repository:** Connected to GitHub `Aravind-git07/Smart_Recycling_System` (Root directory: `backend`).
- **Runtime:** Python 3.
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `GEMINI_API_KEY`: *(Connected Google AI Studio API Key)*
  - `DATABASE_URL`: `sqlite:///./recycling_system.db`

---

## 11. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check (database status, active AI engine). |
| `POST` | `/api/classify` | Upload and analyze waste image; returns predictions and recommendations. |
| `POST` | `/api/manual-select` | Submit manual category selection; returns tailored recycling guidance. |
| `GET` | `/api/dashboard/stats` | Aggregated metrics (totals, method ratio, categories, 7-day trend). |
| `GET` | `/api/history` | Paginated classification records with search and filter parameters. |
| `GET` | `/api/history/{id}` | Detailed recommendation and audit data for a single record. |
| `DELETE` | `/api/history/{id}` | Delete a single history record and remove its stored image. |
| `DELETE` | `/api/history?confirm=true` | Clear all classification records and remove all stored images. |
| `GET` | `/api/categories` | Complete catalog of supported waste categories, descriptions, and codes. |
| `GET` | `/api/guidelines` | Environmental guidelines, waste hierarchy, and common contamination mistakes. |

---

## 12. Database Design

The system uses an ACID-compliant SQLite relational database (`recycling_system.db`) mapped via SQLAlchemy.

### Table: `classification_records`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Autoincrement | Unique record ID |
| `item_name` | String(255) | Not Null | Name of identified/selected item |
| `category` | String(100) | Not Null, Indexed | Standardized category name |
| `classification_method` | String(50) | Not Null, Indexed | `"ai"` or `"manual"` |
| `confidence_score` | Float | Nullable | Model confidence score (0.0 to 1.0) |
| `explanation` | Text | Not Null | Detailed classification rationale |
| `visual_features` | Text | Nullable | JSON array of observed traits |
| `image_filename` | String(255) | Nullable | Stored filename in `/uploads` |
| `image_path` | String(500) | Nullable | Full filesystem path to image |
| `recyclability` | String(50) | Not Null | High, Moderate, Low, or Non-Recyclable |
| `disposal_method` | Text | Not Null | Recommended disposal stream |
| `preparation_steps` | Text | Not Null | JSON array of step-by-step instructions |
| `reuse_ideas` | Text | Not Null | JSON array of practical upcycling tips |
| `contamination_warnings` | Text | Not Null | Critical contamination safeguards |
| `safety_precautions` | Text | Not Null | Handling warnings and hazard notes |
| `local_regulations_note`| Text | Not Null | Regional municipal dependency notes |
| `recycling_code` | String(50) | Nullable | RIC or PAP recycling code |
| `bin_color` | String(50) | Nullable | Target municipal bin color |
| `created_at` | DateTime | Default UTC now, Indexed | Timestamp of classification |

---

## 13. Testing & Verification

### Running Automated Backend Unit & Integration Tests
Execute the standalone test suite to verify database initialization, category normalization, recommendation queries, CV scoring, and SQL analytics:
```powershell
cd c:\projects\Smart_Recycling_System
.\backend\venv\Scripts\python.exe backend\test_backend.py
```
*Result: 6/6 tests passing (100% test coverage across core backend subsystems).*

### Running Frontend Production Build Verification
Confirm the client bundle compiles with zero syntax, JSX, or dependency errors:
```powershell
cd c:\projects\Smart_Recycling_System\frontend
npm run build
```
*Result: Production bundle built in ~900ms.*

---

## 14. College Viva & Presentation Defense Notes

For an in-depth viva preparation reference with anticipated examiner questions and answers, refer to [PROJECT_REVIEW_GUIDE.md](PROJECT_REVIEW_GUIDE.md).

### Summary of Key Defense Talking Points:

1. **How is this project different from a standard toy classifier?**
   - Simple classifiers stop at predicting a label (e.g. "plastic"). This system provides complete downstream circular economy guidance: preparation checklists, resin identification, contamination safeguards, reuse ideas, and municipal caveats.

2. **How does the system ensure zero downtime during lab reviews?**
   - Through a **Graceful Degradation Architecture**:
     - *Tier 1:* Google Gemini Vision API for deep multimodal semantic understanding.
     - *Tier 2:* Built-in Pillow Computer Vision Feature Engine that analyzes center-cropped color channels, specular reflections, and edge density completely offline.
     - *Tier 3:* Manual Waste Selection fallback allowing users to select materials directly and receive verified recycling guidance.

3. **How does the system handle real smartphone photos?**
   - Real phone photos are 6–15 MB JPEGs. The backend applies EXIF orientation correction and auto-compresses them to 1024x1024 (< 300 KB) using Lanczos downsampling before API transmission, preventing Google's 4 MB inline limit error.

4. **Are dashboard statistics calculated dynamically or hardcoded?**
   - All statistics are computed dynamically using SQL aggregate functions (`COUNT`, `GROUP BY`, `DATE` filters) from stored SQLite records.

---

## License
Developed for academic engineering project review, research demonstration, and educational evaluation. Open-source under the MIT License.
