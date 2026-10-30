import json
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..config import UPLOAD_DIR, MAX_IMAGE_SIZE_BYTES, ALLOWED_EXTENSIONS
from ..models.classification import ClassificationRecord
from ..schemas.classification import ClassificationResponse, ManualClassificationRequest, CorrectionRequest, RecommendationDetail
from ..services.ai_classifier import classify_waste_image
from ..services.recommendation_engine import get_recommendation, normalize_category

router = APIRouter(prefix="/api", tags=["Classification"])

@router.post("/classify", response_model=ClassificationResponse)
async def classify_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload and classify an image of waste material using AI.
    Saves image, performs dual-mode vision analysis, links recycling recommendations,
    and stores record into SQLite.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload."
        )

    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
        )

    # Read image contents into memory
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty."
        )

    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image size exceeds limit of {MAX_IMAGE_SIZE_BYTES // (1024*1024)} MB."
        )

    # AI Classification
    try:
        classification_result = classify_waste_image(
            image_bytes=content,
            filename=file.filename,
            mime_type=file.content_type or "image/jpeg"
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification processing failure: {str(exc)}"
        )

    # Generate recommendations
    category = classification_result["category"]
    item_name = classification_result["item_name"]
    recommendations = get_recommendation(category, item_name)

    # Save image file to upload directory with unique name
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    saved_path = UPLOAD_DIR / unique_filename
    with open(saved_path, "wb") as buffer:
        buffer.write(content)

    # Persist in SQLite
    db_record = ClassificationRecord(
        item_name=item_name,
        category=category,
        classification_method="ai",
        confidence_score=classification_result.get("confidence_score"),
        explanation=classification_result.get("explanation", ""),
        visual_features=json.dumps(classification_result.get("visual_features", [])),
        image_filename=unique_filename,
        image_path=str(saved_path),
        recyclability=recommendations.recyclability,
        disposal_method=recommendations.disposal_method,
        preparation_steps=json.dumps(recommendations.preparation_steps),
        reuse_ideas=json.dumps(recommendations.reuse_ideas),
        contamination_warnings=recommendations.contamination_warnings,
        safety_precautions=recommendations.safety_precautions,
        local_regulations_note=recommendations.local_regulations_note,
        recycling_code=recommendations.recycling_code,
        bin_color=recommendations.bin_color
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return ClassificationResponse(
        id=db_record.id,
        category=db_record.category,
        item_name=db_record.item_name,
        classification_method=db_record.classification_method,
        confidence_score=db_record.confidence_score,
        explanation=db_record.explanation,
        visual_features=json.loads(db_record.visual_features or "[]"),
        image_url=f"/api/uploads/{db_record.image_filename}" if db_record.image_filename else None,
        recommendations=recommendations,
        created_at=db_record.created_at
    )

@router.post("/manual-select", response_model=ClassificationResponse)
def manual_waste_selection(
    request: ManualClassificationRequest,
    db: Session = Depends(get_db)
):
    """
    Manually select a waste category to receive recycling recommendations
    without requiring image classification. Records in database with method='manual'.
    """
    canonical_category = normalize_category(request.category)
    item_name = request.item_name or f"Selected {canonical_category}"
    recommendations = get_recommendation(canonical_category, item_name)

    explanation = (
        f"Material category manually designated as '{canonical_category}' by the user. "
        "Standard material recycling protocol and regulatory safety instructions applied."
    )
    if request.notes:
        explanation += f" User notes: {request.notes}"

    db_record = ClassificationRecord(
        item_name=item_name,
        category=canonical_category,
        classification_method="manual",
        confidence_score=None,  # No fabricated confidence for manual
        explanation=explanation,
        visual_features=json.dumps(["Category specified manually via user selector"]),
        image_filename=None,
        image_path=None,
        recyclability=recommendations.recyclability,
        disposal_method=recommendations.disposal_method,
        preparation_steps=json.dumps(recommendations.preparation_steps),
        reuse_ideas=json.dumps(recommendations.reuse_ideas),
        contamination_warnings=recommendations.contamination_warnings,
        safety_precautions=recommendations.safety_precautions,
        local_regulations_note=recommendations.local_regulations_note,
        recycling_code=recommendations.recycling_code,
        bin_color=recommendations.bin_color
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return ClassificationResponse(
        id=db_record.id,
        category=db_record.category,
        item_name=db_record.item_name,
        classification_method=db_record.classification_method,
        confidence_score=db_record.confidence_score,
        explanation=db_record.explanation,
        visual_features=json.loads(db_record.visual_features or "[]"),
        image_url=None,
        recommendations=recommendations,
        created_at=db_record.created_at
    )

@router.post("/correct/{record_id}", response_model=ClassificationResponse)
def correct_classification(
    record_id: int,
    request: CorrectionRequest,
    db: Session = Depends(get_db)
):
    """
    User correction endpoint: When AI predicts incorrectly (e.g. predicts Plastic for Metal),
    the user can correct the category. Updates database record and yields accurate recommendations.
    """
    record = db.query(ClassificationRecord).filter(ClassificationRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Classification record #{record_id} not found."
        )

    corrected_cat = normalize_category(request.category)
    new_item_name = request.item_name or f"{corrected_cat} Item (Corrected)"
    recommendations = get_recommendation(corrected_cat, new_item_name)

    old_category = record.category
    record.category = corrected_cat
    record.item_name = new_item_name
    record.classification_method = "user_corrected"
    record.confidence_score = 1.0  # Verified by user
    
    note_text = f"User corrected classification from '{old_category}' to '{corrected_cat}'."
    if request.notes:
        note_text += f" Note: {request.notes}"
    record.explanation = note_text

    features = json.loads(record.visual_features or "[]")
    features.append(f"Corrected by user to {corrected_cat}")
    record.visual_features = json.dumps(features)

    record.recyclability = recommendations.recyclability
    record.disposal_method = recommendations.disposal_method
    record.preparation_steps = json.dumps(recommendations.preparation_steps)
    record.reuse_ideas = json.dumps(recommendations.reuse_ideas)
    record.contamination_warnings = recommendations.contamination_warnings
    record.safety_precautions = recommendations.safety_precautions
    record.local_regulations_note = recommendations.local_regulations_note
    record.recycling_code = recommendations.recycling_code
    record.bin_color = recommendations.bin_color

    db.commit()
    db.refresh(record)

    return ClassificationResponse(
        id=record.id,
        category=record.category,
        item_name=record.item_name,
        classification_method=record.classification_method,
        confidence_score=record.confidence_score,
        explanation=record.explanation,
        visual_features=json.loads(record.visual_features or "[]"),
        image_url=f"/api/uploads/{record.image_filename}" if record.image_filename else None,
        recommendations=recommendations,
        created_at=record.created_at
    )

