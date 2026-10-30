from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.classification import ClassificationRecord
from ..schemas.classification import DashboardStats, HistoryItem

def calculate_dashboard_stats(db: Session) -> DashboardStats:
    """
    Calculate dynamic dashboard metrics strictly from stored SQLite records.
    Never hardcodes or fabricates statistics.
    """
    total = db.query(func.count(ClassificationRecord.id)).scalar() or 0
    ai_count = db.query(func.count(ClassificationRecord.id)).filter(ClassificationRecord.classification_method == "ai").scalar() or 0
    manual_count = db.query(func.count(ClassificationRecord.id)).filter(ClassificationRecord.classification_method == "manual").scalar() or 0

    # Category counts
    category_rows = db.query(
        ClassificationRecord.category,
        func.count(ClassificationRecord.id)
    ).group_by(ClassificationRecord.category).all()
    category_counts: Dict[str, int] = {cat: count for cat, count in category_rows}

    # Recyclability counts
    recyclability_rows = db.query(
        ClassificationRecord.recyclability,
        func.count(ClassificationRecord.id)
    ).group_by(ClassificationRecord.recyclability).all()
    recyclability_counts: Dict[str, int] = {rec: count for rec, count in recyclability_rows}

    # Method distribution
    method_distribution = {
        "AI Vision": ai_count,
        "Manual Selection": manual_count
    }

    # Recent 5 activity records
    recent_records = db.query(ClassificationRecord).order_by(ClassificationRecord.created_at.desc()).limit(5).all()
    recent_activities: List[HistoryItem] = [
        HistoryItem(
            id=r.id,
            item_name=r.item_name,
            category=r.category,
            classification_method=r.classification_method,
            confidence_score=r.confidence_score,
            recyclability=r.recyclability,
            image_url=f"/api/uploads/{r.image_filename}" if r.image_filename else None,
            created_at=r.created_at,
            summary_disposal=r.disposal_method[:120] + "..." if len(r.disposal_method) > 120 else r.disposal_method
        )
        for r in recent_records
    ]

    # Weekly trend: last 7 calendar days
    today = datetime.utcnow().date()
    weekly_trend: List[Dict[str, Any]] = []
    for day_offset in range(6, -1, -1):
        target_date = today - timedelta(days=day_offset)
        next_date = target_date + timedelta(days=1)
        
        day_total = db.query(func.count(ClassificationRecord.id)).filter(
            ClassificationRecord.created_at >= datetime.combine(target_date, datetime.min.time()),
            ClassificationRecord.created_at < datetime.combine(next_date, datetime.min.time())
        ).scalar() or 0
        
        day_ai = db.query(func.count(ClassificationRecord.id)).filter(
            ClassificationRecord.classification_method == "ai",
            ClassificationRecord.created_at >= datetime.combine(target_date, datetime.min.time()),
            ClassificationRecord.created_at < datetime.combine(next_date, datetime.min.time())
        ).scalar() or 0

        day_manual = day_total - day_ai

        weekly_trend.append({
            "date": target_date.strftime("%b %d"),
            "full_date": str(target_date),
            "total": day_total,
            "ai": day_ai,
            "manual": day_manual
        })

    return DashboardStats(
        total_classifications=total,
        ai_classifications=ai_count,
        manual_classifications=manual_count,
        category_counts=category_counts,
        recyclability_counts=recyclability_counts,
        method_distribution=method_distribution,
        recent_activities=recent_activities,
        weekly_trend=weekly_trend
    )
