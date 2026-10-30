import json
import os
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models.classification import ClassificationRecord
from ..schemas.classification import HistoryResponse, HistoryItem, ClassificationResponse, RecommendationDetail

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("", response_model=HistoryResponse)
def get_classification_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    method: Optional[str] = Query(None, description="Filter by method: ai or manual"),
    search: Optional[str] = Query(None, description="Search term for item name or explanation"),
    db: Session = Depends(get_db)
):
    """
    Retrieve paginated classification history with optional filters and keyword search.
    """
    query = db.query(ClassificationRecord)

    if category and category.lower() != "all":
        query = query.filter(ClassificationRecord.category.ilike(f"%{category.strip()}%"))

    if method and method.lower() in ["ai", "manual"]:
        query = query.filter(ClassificationRecord.classification_method == method.lower())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (ClassificationRecord.item_name.ilike(term)) |
            (ClassificationRecord.explanation.ilike(term)) |
            (ClassificationRecord.category.ilike(term))
        )

    total = query.count()
    records = query.order_by(desc(ClassificationRecord.created_at)).offset((page - 1) * page_size).limit(page_size).all()

    items = [
        HistoryItem(
            id=r.id,
            item_name=r.item_name,
            category=r.category,
            classification_method=r.classification_method,
            confidence_score=r.confidence_score,
            recyclability=r.recyclability,
            image_url=f"/api/uploads/{r.image_filename}" if r.image_filename else None,
            created_at=r.created_at,
            summary_disposal=r.disposal_method[:130] + "..." if len(r.disposal_method) > 130 else r.disposal_method
        )
        for r in records
    ]

    return HistoryResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=items
    )

@router.get("/{record_id}", response_model=ClassificationResponse)
def get_history_detail(
    record_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve full classification and recommendation details for a specific record.
    """
    record = db.query(ClassificationRecord).filter(ClassificationRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Classification record #{record_id} was not found."
        )

    recommendations = RecommendationDetail(
        category=record.category,
        item_name=record.item_name,
        recyclability=record.recyclability,
        disposal_method=record.disposal_method,
        preparation_steps=json.loads(record.preparation_steps or "[]"),
        reuse_ideas=json.loads(record.reuse_ideas or "[]"),
        contamination_warnings=record.contamination_warnings,
        safety_precautions=record.safety_precautions,
        local_regulations_note=record.local_regulations_note,
        recycling_code=record.recycling_code,
        bin_color=record.bin_color
    )

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

@router.delete("/{record_id}")
def delete_history_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a specific record and clean up associated image file.
    """
    record = db.query(ClassificationRecord).filter(ClassificationRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Classification record #{record_id} does not exist."
        )

    # Delete local image file if present
    if record.image_path and os.path.exists(record.image_path):
        try:
            os.remove(record.image_path)
        except OSError:
            pass

    db.delete(record)
    db.commit()
    return {"message": f"Record #{record_id} successfully deleted.", "id": record_id}

@router.delete("")
def clear_all_history(
    confirm: bool = Query(False, description="Confirm deletion of all records"),
    db: Session = Depends(get_db)
):
    """
    Clear all classification history records (useful for test resets).
    """
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide confirm=true to clear all history records."
        )

    records = db.query(ClassificationRecord).all()
    for r in records:
        if r.image_path and os.path.exists(r.image_path):
            try:
                os.remove(r.image_path)
            except OSError:
                pass
        db.delete(r)

    db.commit()
    return {"message": "All classification history has been cleared.", "count": len(records)}
