from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.classification import DashboardStats
from ..services.statistics_service import calculate_dashboard_stats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """
    Calculate and return live recycling statistics directly from stored database records.
    Never fabricates metrics.
    """
    return calculate_dashboard_stats(db)
