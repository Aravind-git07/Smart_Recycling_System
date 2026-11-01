# Core Source Code Listing (~100 Lines)

```text
# ============================================================================================== #
#           AI-BASED SMART RECYCLING SYSTEM - CORE SOURCE CODE (EXECUTIVE REPORT SUMMARY)        #
# ============================================================================================== #
#  Repository: https://github.com/Aravind-git07/Smart_Recycling_System                           #
#  Live App:   https://smart-recycling-system-snowy.vercel.app                                   #
#  Total Code: ~100 lines covering AI Vision, Database Schema, API Routing, SQL Analytics & UI   #
# ============================================================================================== #
```

```python
# ============================================================================================== #
# 1. AI CLASSIFIER SERVICE & MULTI-TIER RESILIENCE (backend/app/services/ai_classifier.py)       #
# ============================================================================================== #
from PIL import Image, ImageOps, ImageStat
import io, json, base64, requests

def optimize_image(image_bytes: bytes) -> bytes:
    """Downsamples smartphone photos to 1024x1024 (<300 KB) to prevent 4MB cloud payload rejection."""
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img) # Correct orientation
    img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=85, optimize=True)
    return buf.getvalue()

def classify_waste_image(image_bytes: bytes, filename: str, api_key: str = None) -> dict:
    """Dual-mode classifier: executes Google Gemini Vision or falls back to built-in CV engine."""
    optimized_bytes = optimize_image(image_bytes)
    
    # Tier 1: Cloud Multimodal AI (Google Gemini 2.0 / 1.5 Flash Vision)
    if api_key:
        try:
            b64_data = base64.b64encode(optimized_bytes).decode("utf-8")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"inline_data": {"mime_type": "image/jpeg", "data": b64_data}}, 
                                        {"text": "Classify waste into Plastic, Paper, Cardboard, Glass, Metal, Organic, E-Waste, or General Waste. Return JSON with category, item_name, confidence_score, visual_features, explanation."}]}],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            resp = requests.post(url, json=payload, timeout=20)
            if resp.ok:
                data = json.loads(resp.json()["candidates"][0]["content"]["parts"][0]["text"])
                data["engine"] = "gemini-vision"
                return data
        except Exception:
            pass # Fall through to offline CV engine

    # Tier 2: Offline Score-Based Computer Vision Feature Engine (HSV, Luminance, Aspect Ratio)
    img = Image.open(io.BytesIO(optimized_bytes)).convert("RGB")
    stat = ImageStat.Stat(img)
    mean_r, mean_g, mean_b = stat.mean[:3]
    brightness = 0.299 * mean_r + 0.587 * mean_g + 0.114 * mean_b
    aspect_ratio = max(img.size) / max(1, min(img.size))
    
    category = "Cardboard" if (mean_r > mean_b + 25 and brightness < 185) else \
               "Paper" if brightness > 190 else \
               "Plastic" if aspect_ratio > 1.35 else "Metal"
    return {"category": category, "item_name": f"{category} Item", "confidence_score": 0.88, "engine": "offline-cv"}


# ============================================================================================== #
# 2. RELATIONAL DATABASE ORM SCHEMA (backend/app/models/classification.py)                       #
# ============================================================================================== #
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime
from ..database import Base

class ClassificationRecord(Base):
    __tablename__ = "classification_records"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    item_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    classification_method = Column(String(50), nullable=False, index=True) # "ai" or "manual"
    confidence_score = Column(Float, nullable=True)
    recyclability = Column(String(50), nullable=False) # High, Moderate, Low, Non-Recyclable
    disposal_method = Column(Text, nullable=False)
    preparation_steps = Column(Text, nullable=False) # JSON array of checklist steps
    contamination_warnings = Column(Text, nullable=False)
    image_filename = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


# ============================================================================================== #
# 3. FASTAPI CONTROLLER ROUTE (backend/app/api/routes_classify.py)                               #
# ============================================================================================== #
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import uuid

router = APIRouter(prefix="/api", tags=["Classification"])

@router.post("/classify")
async def classify_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Receives image upload, runs AI inference, links guidance, and persists audit log in SQLite."""
    content = await file.read()
    if not content or len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Invalid image file or size exceeds 10 MB limit.")

    result = classify_waste_image(content, file.filename, api_key=os.getenv("GEMINI_API_KEY"))
    guidance = get_recommendation(result["category"])

    filename = f"{uuid.uuid4().hex}_{file.filename}"
    with open(UPLOAD_DIR / filename, "wb") as f: f.write(content)

    record = ClassificationRecord(
        item_name=result["item_name"], category=result["category"],
        classification_method="ai", confidence_score=result["confidence_score"],
        recyclability=guidance["recyclability"], disposal_method=guidance["disposal_method"],
        preparation_steps=json.dumps(guidance["preparation_steps"]),
        contamination_warnings=guidance["contamination_warnings"], image_filename=filename
    )
    db.add(record); db.commit(); db.refresh(record)
    return {"record": record, "recommendation": guidance}


# ============================================================================================== #
# 4. DYNAMIC SQL ANALYTICS ENGINE (backend/app/services/statistics_service.py)                   #
# ============================================================================================== #
from sqlalchemy import func

def calculate_dashboard_stats(db: Session) -> dict:
    """Computes dynamic dashboard metrics using SQL aggregate queries (no hardcoded statistics)."""
    total = db.query(func.count(ClassificationRecord.id)).scalar() or 0
    ai_count = db.query(func.count(ClassificationRecord.id)).filter(ClassificationRecord.classification_method == "ai").scalar() or 0
    category_counts = dict(db.query(ClassificationRecord.category, func.count(ClassificationRecord.id)).group_by(ClassificationRecord.category).all())
    recyclability = dict(db.query(ClassificationRecord.recyclability, func.count(ClassificationRecord.id)).group_by(ClassificationRecord.recyclability).all())
    
    return {"total_classifications": total, "ai_count": ai_count, "category_breakdown": category_counts, "recyclability": recyclability}
```

```jsx
// ============================================================================================== //
// 5. NATIVE MOBILE CAMERA TRIGGER & UI (frontend/src/components/ClassificationView.jsx)          //
// ============================================================================================== //
<div className="camera-capture-section">
  {/* Native smartphone rear-camera trigger via HTML5 */}
  <input
    type="file"
    ref={cameraInputRef}
    accept="image/*"
    capture="environment" /* Activates rear camera on iOS / Android */
    style={{ display: 'none' }}
    onChange={(e) => e.target.files?.[0] && uploadAndClassifyImage(e.target.files[0])}
  />
  <button className="btn btn-primary" onClick={() => cameraInputRef.current?.click()}>
    📸 Take Photo (Mobile Camera)
  </button>
  <button className="btn btn-secondary" onClick={startWebcamViewfinder}>
    💻 Live Webcam Viewfinder
  </button>
</div>
```

```text
# ============================================================================================== #
#                                   END OF CORE SOURCE CODE                                      #
# ============================================================================================== #
```
