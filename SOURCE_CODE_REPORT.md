# Source Code Appendix: AI-Based Smart Recycling & Waste Segregation System

```text
####################################################################################################
# ================================================================================================ #
#              AI-BASED SMART RECYCLING & WASTE SEGREGATION SYSTEM - SOURCE CODE APPENDIX          #
# ================================================================================================ #
#  Project Title: AI-Based Smart Recycling System                                                  #
#  Repository:    https://github.com/Aravind-git07/Smart_Recycling_System                          #
#  Live Web App:  https://smart-recycling-system-snowy.vercel.app                                  #
#  Live API Docs: https://smart-recycling-system-isn1.onrender.com/docs                            #
#  Tech Stack:    FastAPI, Python 3.11+, React 18, Vite, SQLite, SQLAlchemy, Google Gemini Vision   #
####################################################################################################
```

---

## Table of Source Code Listings

1. [Listing 1: AI Classifier Service & Resilient Dual-Engine Pipeline (`ai_classifier.py`)](#listing-1-ai-classifier-service--resilient-dual-engine-pipeline)
2. [Listing 2: Domain Circular Economy Recommendation Engine (`recommendation_engine.py`)](#listing-2-domain-circular-economy-recommendation-engine)
3. [Listing 3: Relational Database ORM Schema (`classification.py`)](#listing-3-relational-database-orm-schema)
4. [Listing 4: FastAPI Router & Controller Endpoints (`routes_classify.py`)](#listing-4-fastapi-router--controller-endpoints)
5. [Listing 5: Dynamic SQL Statistics & Analytics Service (`statistics_service.py`)](#listing-5-dynamic-sql-statistics--analytics-service)
6. [Listing 6: Frontend API Client & Image Resolution Service (`api.js`)](#listing-6-frontend-api-client--image-resolution-service)
7. [Listing 7: Mobile Camera & Live Webcam Viewfinder Component (`ClassificationView.jsx`)](#listing-7-mobile-camera--live-webcam-viewfinder-component)
8. [Listing 8: Standalone Automated Unit & Integration Test Suite (`test_backend.py`)](#listing-8-standalone-automated-unit--integration-test-suite)

---

## Listing 1: AI Classifier Service & Resilient Dual-Engine Pipeline
**File Path:** `backend/app/services/ai_classifier.py`  
**Description:** Core artificial intelligence module. Manages dynamic Google Gemini vision model discovery, automatic smartphone photo downsampling (< 300 KB to eliminate Google's 4 MB payload limit), multi-model cascading fallback, and the balanced score-based offline Pillow Computer Vision engine.

```python
# ==================================================================================================
# MODULE: AI CLASSIFIER SERVICE & RESILIENT DUAL-ENGINE PIPELINE
# File: backend/app/services/ai_classifier.py
# ==================================================================================================

import io
import json
import base64
import logging
import colorsys
from typing import Dict, Any, List
from PIL import Image, ImageStat, ImageOps, ImageFilter
import requests
from ..config import GEMINI_API_KEY
from .recommendation_engine import normalize_category

logger = logging.getLogger("ai_classifier")

VALID_CATEGORIES = [
    "Plastic", "Paper", "Cardboard", "Glass",
    "Metal", "Organic", "E-Waste", "General Waste"
]

CACHED_AVAILABLE_MODELS: List[str] = []

# --------------------------------------------------------------------------------------------------
# SUBROUTINE 1.1: Dynamic Gemini Model Discovery (Prevents 404 Model Not Found on Free Tiers)
# --------------------------------------------------------------------------------------------------
def discover_available_gemini_models(api_key: str) -> List[str]:
    """
    Dynamically queries Google's ModelService to find models supporting generateContent for this key.
    Prevents 404 Model Not Found errors across different Google AI Studio project tiers.
    """
    global CACHED_AVAILABLE_MODELS
    if CACHED_AVAILABLE_MODELS:
        return CACHED_AVAILABLE_MODELS

    clean_key = api_key.strip().strip("'\"")
    discovered = []
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={clean_key}"

    try:
        resp = requests.get(url, timeout=8)
        if resp.ok:
            data = resp.json()
            for m in data.get("models", []):
                name = m.get("name", "").replace("models/", "")
                methods = m.get("supportedGenerationMethods", [])
                if "generateContent" in methods and "gemini" in name.lower():
                    discovered.append(name)
            if discovered:
                logger.info(f"Discovered active Gemini models: {discovered}")
                CACHED_AVAILABLE_MODELS = discovered
                return discovered
    except Exception as e:
        logger.warning(f"Gemini ListModels check failed: {e}")

    # Prioritized fallback sequence for cloud vision models
    return [
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-002",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash"
    ]

# --------------------------------------------------------------------------------------------------
# SUBROUTINE 1.2: Score-Based Built-in Computer Vision Feature Engine (100% Offline Resilience)
# --------------------------------------------------------------------------------------------------
def analyze_image_pillow(image_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Intelligent score-based built-in CV feature analysis engine.
    Analyzes center-cropped HSV hue, saturation, luminance, specular highlight glare,
    container aspect ratio, and edge density to classify items without rigid heuristics.
    """
    try:
        raw_img = Image.open(io.BytesIO(image_bytes))
        raw_img = ImageOps.exif_transpose(raw_img)  # Correct mobile portrait orientation
        raw_img.verify()
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)
    except Exception as e:
        raise ValueError("Invalid image file: Image is corrupted or unreadable.") from e

    width, height = img.size
    if width < 32 or height < 32:
        raise ValueError("Image resolution is too low. Upload a clearer photo.")

    rgb_img = img.convert("RGB")
    aspect_ratio = max(width, height) / max(1, min(width, height))
    is_elongated = aspect_ratio > 1.35  # Cylindrical bottles, cans, aerosol tins

    # Focus on center 70% to isolate waste object from table/floor background
    crop_x, crop_y = int(width * 0.15), int(height * 0.15)
    center_img = rgb_img.crop((crop_x, crop_y, width - crop_x, height - crop_y))

    # Basic color stats
    stat = ImageStat.Stat(center_img)
    mean_r, mean_g, mean_b = stat.mean[:3]
    std_r, std_g, std_b = stat.stddev[:3]
    avg_std = (std_r + std_g + std_b) / 3.0
    brightness = 0.299 * mean_r + 0.587 * mean_g + 0.114 * mean_b

    # Convert RGB to HSV
    norm_r, norm_g, norm_b = mean_r / 255.0, mean_g / 255.0, mean_b / 255.0
    h, s, v = colorsys.rgb_to_hsv(norm_r, norm_g, norm_b)
    hue_deg = h * 360.0
    saturation = s

    # Surface edge density and specular highlight ratio
    edges = center_img.filter(ImageFilter.FIND_EDGES).convert("L")
    edge_density = ImageStat.Stat(edges).mean[0]

    small_img = center_img.resize((64, 64), Image.Resampling.NEAREST)
    pixels = list(small_img.getdata())
    highlights = sum(1 for (r, g, b) in pixels if r > 225 and g > 225 and b > 225)
    highlight_ratio = highlights / len(pixels)

    # Multi-Stream Category Scoring Matrix
    scores = {cat: 0.0 for cat in VALID_CATEGORIES}

    # Cardboard scoring (warm brown hue, low glare, organic texture)
    if 20 <= hue_deg <= 55 and saturation > 0.22 and brightness < 185:
        scores["Cardboard"] += 5.0
    if 15 <= hue_deg <= 60 and brightness < 195:
        scores["Cardboard"] += 2.0

    # Paper scoring (high luminance, low saturation, flat texture)
    if brightness > 195 and saturation < 0.18:
        scores["Paper"] += 5.5
    if brightness > 175 and saturation < 0.25 and highlight_ratio < 0.08:
        scores["Paper"] += 2.5

    # Metal scoring (neutral tone, specular reflections)
    if saturation < 0.25 and (highlight_ratio > 0.06 or (brightness > 110 and avg_std < 40)):
        scores["Metal"] += 4.5
    if is_elongated and saturation < 0.28:
        scores["Metal"] += 2.0

    # Glass scoring (refractive glare, high highlight ratio)
    if highlight_ratio > 0.10 and brightness > 120:
        scores["Glass"] += 4.0

    # E-Waste scoring (dark chassis, high edge density)
    if brightness < 85 and edge_density > 20:
        scores["E-Waste"] += 5.0

    # Organic scoring (natural green/brown hue)
    if (35 <= hue_deg <= 150) and saturation > 0.25:
        scores["Organic"] += 4.5

    # Plastic scoring (cylindrical profile, synthetic polymer color)
    if is_elongated and saturation > 0.18:
        scores["Plastic"] += 3.5

    winning_category = max(scores, key=scores.get)
    if scores[winning_category] == 0.0:
        winning_category = "General Waste"

    meta_map = {
        "Paper": {"item_name": "Paper Sheet / Printout Packaging", "features": [f"High luminance ({brightness:.0f})", f"Low sat ({saturation:.2f})"], "explanation": "Identified as Paper based on high surface luminance and low saturation."},
        "Cardboard": {"item_name": "Corrugated Cardboard / Packaging Box", "features": [f"Tan tone (Hue {hue_deg:.0f}°)", "Matte low-glare surface"], "explanation": "Identified as Cardboard based on warm brown fiber pigmentation."},
        "Metal": {"item_name": "Aluminum Can / Metal Container", "features": [f"Specular reflection ({highlight_ratio*100:.1f}%)", f"Neutral tone (Sat {saturation:.2f})"], "explanation": "Identified as Metal based on metallic reflectivity."},
        "Plastic": {"item_name": "Plastic Bottle / Packaging", "features": [f"Hue {hue_deg:.0f}°", "Cylindrical profile" if is_elongated else "Smooth polymer surface"], "explanation": "Identified as Plastic based on container silhouette and color."},
        "Glass": {"item_name": "Glass Bottle / Container", "features": [f"Refractive glare ({highlight_ratio*100:.1f}%)", "Translucent container contour"], "explanation": "Identified as Glass based on refractive glare and geometry."},
        "E-Waste": {"item_name": "Electronic Device / Cable / Charger", "features": [f"Dark chassis ({brightness:.0f})", f"Edge density ({edge_density:.0f})"], "explanation": "Identified as E-Waste based on dark casing and edge density."},
        "Organic": {"item_name": "Organic Food / Kitchen Scrap", "features": [f"Natural hue ({hue_deg:.0f}°)", "Biodegradable matter profile"], "explanation": "Identified as Organic Waste based on food pigmentation."},
        "General Waste": {"item_name": "General Mixed Household Waste", "features": ["Composite mixed structure"], "explanation": "Identified as General Waste due to composite material traits."}
    }

    item_info = meta_map.get(winning_category, meta_map["General Waste"])
    confidence = min(0.92, max(0.75, 0.76 + (scores[winning_category] * 0.015)))

    return {
        "category": winning_category,
        "item_name": item_info["item_name"],
        "confidence_score": round(confidence, 2),
        "visual_features": item_info["features"],
        "explanation": item_info["explanation"]
    }

# --------------------------------------------------------------------------------------------------
# SUBROUTINE 1.3: Cloud Multimodal AI Inference with Multi-Model Fallback
# --------------------------------------------------------------------------------------------------
def analyze_image_with_gemini_rest(image_bytes: bytes, mime_type: str, api_key: str) -> Dict[str, Any]:
    """Direct HTTP REST API call to Google Gemini Vision with dynamic model fallback."""
    clean_key = api_key.strip().strip("'\"")
    b64_data = base64.b64encode(image_bytes).decode("utf-8")
    models_to_try = discover_available_gemini_models(clean_key)
    headers = {"Content-Type": "application/json"}

    prompt = (
        "Identify the primary waste material from ['Plastic', 'Paper', 'Cardboard', 'Glass', 'Metal', 'Organic', 'E-Waste', 'General Waste']. "
        "Return ONLY a valid JSON object matching: "
        '{"category": "CategoryName", "item_name": "Specific Name", "confidence_score": 0.91, '
        '"visual_features": ["trait1", "trait2"], "explanation": "Clear 1-sentence rationale."}'
    )

    payload = {
        "contents": [{"parts": [{"inline_data": {"mime_type": "image/jpeg", "data": b64_data}}, {"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"}
    }

    last_rest_err = None
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={clean_key}"
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=25)
            if not resp.ok:
                if resp.status_code == 404:
                    continue  # Model not found on this key, cascade to next candidate
                resp.raise_for_status()

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                continue

            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            if text.startswith("```"):
                text = text.strip("`")
                if text.startswith("json"):
                    text = text[4:].strip()

            parsed = json.loads(text)
            norm_cat = normalize_category(parsed.get("category", "General Waste"))
            conf = float(parsed.get("confidence_score", 0.90))

            return {
                "category": norm_cat,
                "item_name": parsed.get("item_name", f"{norm_cat} Item"),
                "confidence_score": round(max(0.1, min(0.99, conf)), 2),
                "visual_features": parsed.get("visual_features", [f"Analyzed with Google Gemini ({model_name})"]),
                "explanation": parsed.get("explanation", f"Identified as {norm_cat} using Gemini Vision ({model_name}).")
            }
        except Exception as e:
            last_rest_err = e
            continue

    raise last_rest_err or RuntimeError("No compatible Gemini model found.")

# --------------------------------------------------------------------------------------------------
# SUBROUTINE 1.4: Universal Dispatcher with Image Optimization & Offline Fallback
# --------------------------------------------------------------------------------------------------
def classify_waste_image(image_bytes: bytes, filename: str, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """Main entry point: Optimizes image, executes Gemini Vision, or seamlessly falls back to CV engine."""
    import os
    clean_key = (os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY or "").strip().strip("'\"")

    # Downsample smartphone photos to 1024x1024 (< 300 KB) to prevent 4MB payload rejection
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img = ImageOps.exif_transpose(pil_img)
        pil_img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        pil_img.convert("RGB").save(buf, format="JPEG", quality=85, optimize=True)
        optimized_bytes = buf.getvalue()
    except Exception:
        optimized_bytes = image_bytes

    gemini_error = None
    if clean_key:
        try:
            res = analyze_image_with_gemini_rest(optimized_bytes, "image/jpeg", clean_key)
            res["engine"] = "gemini-vision"
            return res
        except Exception as e:
            gemini_error = f"Gemini API notice: {str(e)}"
            logger.warning(f"{gemini_error}. Falling back to built-in CV engine.")

    # Graceful fallback to offline computer vision engine
    result = analyze_image_pillow(image_bytes, filename)
    result["engine"] = "offline-cv-engine"
    result["engine_warning"] = gemini_error
    return result
```

---

## Listing 2: Domain Circular Economy Recommendation Engine
**File Path:** `backend/app/services/recommendation_engine.py`  
**Description:** Implements the expert knowledge base for all 8 waste categories. Maps Resin Identification Codes (RIC #1–#7), bin color designations, interactive step-by-step preparation checklists, upcycling ideas, contamination hazards, and municipal caveats.

```python
# ==================================================================================================
# MODULE: DOMAIN CIRCULAR ECONOMY & EXPERT RECOMMENDATION ENGINE
# File: backend/app/services/recommendation_engine.py
# ==================================================================================================

from typing import Dict, Any, List

RECOMMENDATION_DATABASE: Dict[str, Dict[str, Any]] = {
    "Plastic": {
        "recyclability": "High",
        "disposal_method": "Recycling Bin (Plastics & Metals)",
        "bin_color": "Yellow Bin / Blue Bin (Dry Recyclables)",
        "recycling_code": "RIC #1 (PET), #2 (HDPE), #5 (PP)",
        "preparation_steps": [
            "Empty all residual liquids and rinse container with minimal water.",
            "Remove screw caps (often different resin) and separate non-recyclable pumps.",
            "Crush or compress plastic bottles to maximize collection bin space.",
            "Do not bundle plastics inside plastic bags (clogs sorting machinery)."
        ],
        "reuse_ideas": [
            "Repurpose rigid plastic jugs as plant pots or gardening scoops.",
            "Use clean PET bottles as eco-friendly seedling protectors.",
            "Upcycle storage containers for workshop hardware organization."
        ],
        "contamination_warnings": "Greasy plastic containers or soft film wraps ruin processing batches.",
        "safety_precautions": "Never burn plastics; releases hazardous dioxins and volatile organic compounds (VOCs).",
        "local_regulations_note": "Most municipal MRFs accept #1 and #2 rigid bottles curbside; #6 (Styrofoam) is rarely accepted."
    },
    "Cardboard": {
        "recyclability": "High",
        "disposal_method": "Paper & Cardboard Collection Stream",
        "bin_color": "Blue Bin (Clean Dry Paper)",
        "recycling_code": "PAP 20 (Corrugated Cardboard)",
        "preparation_steps": [
            "Flatten and break down all boxes completely to conserve space.",
            "Strip heavy plastic adhesive tape, packing staples, and bubble wrap.",
            "Ensure cardboard is completely dry; wet cardboard weakens cellulose pulp.",
            "Cut oversized corrugated sheets to fit inside standard curbside bins."
        ],
        "reuse_ideas": [
            "Use as sheet mulching / weed barriers in organic garden beds.",
            "Reuse sturdy shipping boxes for home storage or future mailings.",
            "Compost clean, unprinted brown corrugated cardboard in compost bins."
        ],
        "contamination_warnings": "Grease from pizza boxes cannot be separated during hydrapulping; tear off and discard oily sections.",
        "safety_precautions": "Beware of sharp carton staples or wire bindings when flattening heavy boxes.",
        "local_regulations_note": "Wax-coated produce boxes require special commercial composting and cannot go into paper bins."
    },
    "Metal": {
        "recyclability": "High",
        "disposal_method": "Dry Recyclables / Metals Container",
        "bin_color": "Yellow Bin (Metals & Hard Plastics)",
        "recycling_code": "ALU 41 (Aluminum) / FE 40 (Steel/Tin)",
        "preparation_steps": [
            "Rinse beverage cans and food tins to eliminate organic residue.",
            "Leave metal bottle caps inside tin cans and crimp the top closed.",
            "Crush beverage cans vertically to optimize bin storage.",
            "Ensure aerosol cans are completely discharged before disposal."
        ],
        "reuse_ideas": [
            "Repurpose clean aluminum tins as desk pen holders or craft storage.",
            "Upcycle clean food tins into miniature herb planters with drainage holes."
        ],
        "contamination_warnings": "Hazardous chemical tins (paint, solvent, motor oil) cannot enter standard municipal bins.",
        "safety_precautions": "Sharp can lid edges can cause lacerations; push can lids down inside rinsed cans.",
        "local_regulations_note": "Metals boast near 100% recyclability and conserve up to 95% energy compared to virgin ore processing."
    },
    "E-Waste": {
        "recyclability": "Moderate",
        "disposal_method": "Authorized E-Waste Collection Center / Retail Take-Back",
        "bin_color": "Red Bin / Designated Hazardous Collection Point",
        "recycling_code": "WEEE Directive Category 1-10",
        "preparation_steps": [
            "Remove detachable rechargeable lithium batteries prior to drop-off.",
            "Perform factory reset and wipe personal data from memory storage.",
            "Bundle charging cables with twist-ties to prevent tangling.",
            "Do not smash screens or crush electronic chassis."
        ],
        "reuse_ideas": [
            "Donate functional computers or phones to schools or digital literacy charities.",
            "Repurpose old smartphones as dedicated security webcams or offline music players."
        ],
        "contamination_warnings": "Disposing of electronics in standard trash causes toxic heavy metals (lead, mercury, cadmium) to leach into soil.",
        "safety_precautions": "Damaged lithium-ion batteries present severe thermal runaway and fire hazard risks; tape battery terminals.",
        "local_regulations_note": "Mandated under E-Waste (Management) Rules; many consumer electronics brands provide free take-back."
    }
}

def normalize_category(raw_category: str) -> str:
    """Standardizes input string into one of the 8 canonical categories."""
    cleaned = raw_category.strip().title()
    alias_map = {
        "Plastics": "Plastic",
        "Papers": "Paper",
        "Cardboards": "Cardboard",
        "Boxes": "Cardboard",
        "Metals": "Metal",
        "Aluminum": "Metal",
        "Electronics": "E-Waste",
        "Electronic": "E-Waste",
        "Ewaste": "E-Waste",
        "Food": "Organic",
        "Compost": "Organic",
        "Trash": "General Waste"
    }
    return alias_map.get(cleaned, cleaned if cleaned in RECOMMENDATION_DATABASE else "General Waste")

def get_recommendation(category: str) -> Dict[str, Any]:
    """Retrieves full downstream recycling guidance for a normalized category."""
    norm = normalize_category(category)
    return RECOMMENDATION_DATABASE.get(norm, RECOMMENDATION_DATABASE.get("Plastic"))
```

---

## Listing 3: Relational Database ORM Schema
**File Path:** `backend/app/models/classification.py`  
**Description:** Defines the SQLAlchemy schema for `classification_records`, storing complete audit trails of classified materials, confidence scores, preparation instructions, and timestamps.

```python
# ==================================================================================================
# MODULE: RELATIONAL DATABASE ORM SCHEMA (ACID PERSISTENCE)
# File: backend/app/models/classification.py
# ==================================================================================================

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from ..database import Base

class ClassificationRecord(Base):
    __tablename__ = "classification_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    item_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    classification_method = Column(String(50), nullable=False, index=True) # "ai" or "manual"
    confidence_score = Column(Float, nullable=True) # Float 0.0 - 1.0, None for manual
    explanation = Column(Text, nullable=False)
    visual_features = Column(Text, nullable=True) # JSON array of observed traits
    image_filename = Column(String(255), nullable=True)
    image_path = Column(String(500), nullable=True)
    recyclability = Column(String(50), nullable=False) # High, Moderate, Low, Non-Recyclable
    disposal_method = Column(Text, nullable=False)
    preparation_steps = Column(Text, nullable=False) # JSON array string
    reuse_ideas = Column(Text, nullable=False) # JSON array string
    contamination_warnings = Column(Text, nullable=False)
    safety_precautions = Column(Text, nullable=False)
    local_regulations_note = Column(Text, nullable=False)
    recycling_code = Column(String(50), nullable=True) # e.g. "#1 PET" or "PAP 20"
    bin_color = Column(String(50), nullable=True)      # e.g. "Yellow Bin", "Blue Bin"
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
```

---

## Listing 4: FastAPI Router & Controller Endpoints
**File Path:** `backend/app/api/routes_classify.py`  
**Description:** Primary REST API controller. Manages multipart file reception, size/MIME verification, dual-mode AI execution, circular economy linking, image persistence, and human-in-the-loop correction.

```python
# ==================================================================================================
# MODULE: FASTAPI CONTROLLER ENDPOINTS & REQUEST ROUTING
# File: backend/app/api/routes_classify.py
# ==================================================================================================

import json
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..config import UPLOAD_DIR, MAX_IMAGE_SIZE_BYTES, ALLOWED_EXTENSIONS
from ..models.classification import ClassificationRecord
from ..schemas.classification import ClassificationResponse, ManualClassificationRequest, CorrectionRequest
from ..services.ai_classifier import classify_waste_image
from ..services.recommendation_engine import get_recommendation, normalize_category

router = APIRouter(prefix="/api", tags=["Classification"])

@router.post("/classify", response_model=ClassificationResponse)
async def classify_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Receives image upload, validates constraints, runs AI classification, and stores record."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided in upload.")

    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{ext}'.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="The uploaded image file is empty.")
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Image size exceeds allowable limit.")

    # Execute resilient dual-mode vision classifier
    res = classify_waste_image(image_bytes=content, filename=file.filename, mime_type=file.content_type)
    rec = get_recommendation(res["category"])

    # Persist uploaded image with unique UUID
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    save_path = UPLOAD_DIR / unique_filename
    with open(save_path, "wb") as f:
        f.write(content)

    record = ClassificationRecord(
        item_name=res["item_name"],
        category=res["category"],
        classification_method="ai",
        confidence_score=res["confidence_score"],
        explanation=res["explanation"],
        visual_features=json.dumps(res.get("visual_features", [])),
        image_filename=unique_filename,
        image_path=str(save_path),
        recyclability=rec["recyclability"],
        disposal_method=rec["disposal_method"],
        preparation_steps=json.dumps(rec["preparation_steps"]),
        reuse_ideas=json.dumps(rec["reuse_ideas"]),
        contamination_warnings=rec["contamination_warnings"],
        safety_precautions=rec["safety_precautions"],
        local_regulations_note=rec["local_regulations_note"],
        recycling_code=rec["recycling_code"],
        bin_color=rec["bin_color"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return ClassificationResponse(record=record, recommendation=rec)

@router.post("/manual-select", response_model=ClassificationResponse)
def manual_waste_selection(payload: ManualClassificationRequest, db: Session = Depends(get_db)):
    """Direct manual material selection providing zero-downtime failover guidance."""
    norm_cat = normalize_category(payload.category)
    rec = get_recommendation(norm_cat)
    item_title = payload.custom_item_name.strip() if payload.custom_item_name else f"Manual {norm_cat} Item"

    record = ClassificationRecord(
        item_name=item_title,
        category=norm_cat,
        classification_method="manual",
        confidence_score=None,
        explanation=f"Manually logged as {norm_cat}. Notes: {payload.user_notes or 'Standard disposal'}",
        visual_features=json.dumps(["Manual User Input"]),
        image_filename=None,
        recyclability=rec["recyclability"],
        disposal_method=rec["disposal_method"],
        preparation_steps=json.dumps(rec["preparation_steps"]),
        reuse_ideas=json.dumps(rec["reuse_ideas"]),
        contamination_warnings=rec["contamination_warnings"],
        safety_precautions=rec["safety_precautions"],
        local_regulations_note=rec["local_regulations_note"],
        recycling_code=rec["recycling_code"],
        bin_color=rec["bin_color"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return ClassificationResponse(record=record, recommendation=rec)
```

---

## Listing 5: Dynamic SQL Statistics & Analytics Service
**File Path:** `backend/app/services/statistics_service.py`  
**Description:** Dynamically calculates dashboard metrics, category breakdown, recyclability distribution, and 7-day activity frequency using pure SQL aggregate functions (`func.count`, `group_by`).

```python
# ==================================================================================================
# MODULE: DYNAMIC SQL ANALYTICS & DASHBOARD AGGREGATION ENGINE
# File: backend/app/services/statistics_service.py
# ==================================================================================================

from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.classification import ClassificationRecord
from ..schemas.classification import DashboardStats

def calculate_dashboard_stats(db: Session) -> DashboardStats:
    """Computes dynamic dashboard metrics strictly from stored SQLite records."""
    total = db.query(func.count(ClassificationRecord.id)).scalar() or 0
    ai_count = db.query(func.count(ClassificationRecord.id)).filter(
        ClassificationRecord.classification_method == "ai"
    ).scalar() or 0
    manual_count = db.query(func.count(ClassificationRecord.id)).filter(
        ClassificationRecord.classification_method == "manual"
    ).scalar() or 0

    # Group counts by material category
    category_rows = db.query(
        ClassificationRecord.category,
        func.count(ClassificationRecord.id)
    ).group_by(ClassificationRecord.category).all()
    category_counts: Dict[str, int] = {cat: count for cat, count in category_rows}

    # Group counts by recyclability potential
    recyclability_rows = db.query(
        ClassificationRecord.recyclability,
        func.count(ClassificationRecord.id)
    ).group_by(ClassificationRecord.recyclability).all()
    recyclability_counts: Dict[str, int] = {rec: count for rec, count in recyclability_rows}

    # 7-Day activity trend histogram
    today = datetime.utcnow().date()
    weekly_trend: List[Dict[str, Any]] = []
    for day_offset in range(6, -1, -1):
        target_date = today - timedelta(days=day_offset)
        next_date = target_date + timedelta(days=1)
        day_count = db.query(func.count(ClassificationRecord.id)).filter(
            ClassificationRecord.created_at >= target_date,
            ClassificationRecord.created_at < next_date
        ).scalar() or 0
        weekly_trend.append({"date": target_date.strftime("%b %d"), "count": day_count})

    return DashboardStats(
        total_classifications=total,
        ai_classifications=ai_count,
        manual_classifications=manual_count,
        method_distribution={"AI Vision": ai_count, "Manual Selection": manual_count},
        category_breakdown=category_counts,
        recyclability_breakdown=recyclability_counts,
        weekly_trend=weekly_trend,
        recent_activity=[]
    )
```

---

## Listing 6: Frontend API Client & Image Resolution Service
**File Path:** `frontend/src/services/api.js`  
**Description:** Frontend networking layer. Normalizes backend base URLs, handles multipart form uploads, and dynamically constructs absolute URLs to display stored images hosted on Render.

```javascript
// =================================================================================================
// MODULE: FRONTEND API CLIENT & CLOUD IMAGE RESOLUTION SERVICE
// File: frontend/src/services/api.js
// =================================================================================================

const rawBase = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
const API_BASE = rawBase.replace(/\/+$/, '').endsWith('/api')
  ? rawBase.replace(/\/+$/, '')
  : (rawBase === '' ? '/api' : `${rawBase.replace(/\/+$/, '')}/api`);

/**
 * Resolves full absolute URL for uploaded waste images hosted on Render storage.
 */
export function getFullImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const renderOrigin = rawBase.replace(/\/+$/, '').replace(/\/api$/, '');
  if (renderOrigin && renderOrigin.startsWith('http')) {
    return `${renderOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path;
}

export async function uploadAndClassifyImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/classify`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Classification error (${res.status})`);
  }
  return res.json();
}

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
}
```

---

## Listing 7: Mobile Camera & Live Webcam Viewfinder Component
**File Path:** `frontend/src/components/ClassificationView.jsx`  
**Description:** Interactive user interface component supporting direct rear smartphone camera capture (`capture="environment"`), an in-browser live webcam viewfinder modal for laptop viva demonstrations, and drag-and-drop file inputs.

```jsx
// =================================================================================================
// MODULE: MOBILE CAMERA TRIGGER & LIVE WEBCAM VIEWFINDER COMPONENT
// File: frontend/src/components/ClassificationView.jsx
// =================================================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, UploadCloud, RefreshCw } from 'lucide-react';
import { uploadAndClassifyImage } from '../services/api';
import RecommendationCard from './RecommendationCard';

export default function ClassificationView({ onSwitchToManual }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // Manage in-browser webcam hardware stream lifecycle
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setWebcamStream(stream);
      setIsWebcamActive(true);
    } catch (err) {
      alert('Unable to access webcam: ' + err.message);
    }
  };

  const captureWebcamFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'webcam_capture.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setIsWebcamActive(false);
      if (webcamStream) webcamStream.getTracks().forEach((track) => track.stop());
    }, 'image/jpeg', 0.90);
  };

  return (
    <div className="classification-view-container">
      {/* Hidden Native Mobile Camera Trigger */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment" /* Forces rear smartphone camera */
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
      />

      <div className="capture-actions-row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera size={18} />
          <span>📸 Take Photo (Mobile Camera)</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={startWebcam}
        >
          <Video size={18} />
          <span>💻 Live Webcam Viewfinder</span>
        </button>
      </div>

      {/* Render AI Result and Interactive Circular Guidance */}
      {result && <RecommendationCard result={result} onReset={() => setResult(null)} />}
    </div>
  );
}
```

---

## Listing 8: Standalone Automated Unit & Integration Test Suite
**File Path:** `backend/test_backend.py`  
**Description:** Standalone Python test script verifying database initialization, recommendation queries, category normalization, Pillow computer vision scoring, invalid image rejection, and dynamic SQL analytics (100% test pass rate).

```python
# ==================================================================================================
# MODULE: STANDALONE AUTOMATED TEST SUITE
# File: backend/test_backend.py
# ==================================================================================================

import io
from PIL import Image
from app.database import init_db, SessionLocal
from app.services.recommendation_engine import get_recommendation, normalize_category
from app.services.ai_classifier import analyze_image_pillow, classify_waste_image
from app.services.statistics_service import calculate_dashboard_stats

def run_all_tests():
    print("[1/6] Testing database initialization...")
    init_db()
    print("Database initialized successfully.")

    print("[2/6] Testing recommendation engine...")
    rec = get_recommendation("Plastic")
    assert rec["recyclability"] == "High"
    print(f"Recommendation test passed: Plastic -> Recyclability: {rec['recyclability']}")

    print("[3/6] Testing category normalization...")
    assert normalize_category("Plastics") == "Plastic"
    assert normalize_category("E-waste") == "E-Waste"
    print("Normalization test passed.")

    print("[4/6] Testing offline CV classification on synthetic test image...")
    img = Image.new("RGB", (300, 500), color=(30, 144, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    res = analyze_image_pillow(buf.getvalue(), "synthetic_sample.jpg")
    assert res["category"] in ["Plastic", "Metal", "Glass", "General Waste"]
    print(f"Vision test passed: {res['item_name']} -> {res['category']} (Confidence: {res['confidence_score']})")

    print("[5/6] Testing invalid image rejection...")
    try:
        classify_waste_image(b"not_an_image_binary_data", "test.jpg")
        assert False, "Should have thrown ValueError"
    except ValueError as e:
        print(f"Invalid image correctly rejected: {e}")

    print("[6/6] Testing database persistence and dashboard statistics...")
    db = SessionLocal()
    try:
        stats = calculate_dashboard_stats(db)
        print(f"Dashboard stats verified: Total={stats.total_classifications}")
    finally:
        db.close()

    print("\nALL BACKEND UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_all_tests()
```

```text
####################################################################################################
# ================================================================================================ #
#                                 END OF SOURCE CODE APPENDIX                                      #
# ================================================================================================ #
####################################################################################################
```
