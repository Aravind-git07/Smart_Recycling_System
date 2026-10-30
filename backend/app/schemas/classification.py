from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class RecommendationDetail(BaseModel):
    category: str
    item_name: str
    recyclability: str
    disposal_method: str
    preparation_steps: List[str]
    reuse_ideas: List[str]
    contamination_warnings: str
    safety_precautions: str
    local_regulations_note: str
    recycling_code: Optional[str] = None
    bin_color: Optional[str] = None

class ClassificationResponse(BaseModel):
    id: int
    category: str
    item_name: str
    classification_method: str  # "ai" or "manual"
    confidence_score: Optional[float] = None
    explanation: str
    visual_features: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    recommendations: RecommendationDetail
    created_at: datetime

    class Config:
        from_attributes = True

class ManualClassificationRequest(BaseModel):
    category: str = Field(..., description="Selected waste category")
    item_name: Optional[str] = Field(None, description="Optional custom name or description of the item")
    notes: Optional[str] = Field(None, description="Optional user notes")

class CorrectionRequest(BaseModel):
    category: str = Field(..., description="The user-corrected waste category")
    item_name: Optional[str] = Field(None, description="Optional corrected item name")
    notes: Optional[str] = Field(None, description="Optional correction notes")

class HistoryItem(BaseModel):
    id: int
    item_name: str
    category: str
    classification_method: str
    confidence_score: Optional[float] = None
    recyclability: str
    image_url: Optional[str] = None
    created_at: datetime
    summary_disposal: str

    class Config:
        from_attributes = True

class HistoryResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[HistoryItem]

class DashboardStats(BaseModel):
    total_classifications: int
    ai_classifications: int
    manual_classifications: int
    category_counts: Dict[str, int]
    recyclability_counts: Dict[str, int]
    method_distribution: Dict[str, int]
    recent_activities: List[HistoryItem]
    weekly_trend: List[Dict[str, Any]]

class WasteCategoryDetail(BaseModel):
    id: str
    name: str
    description: str
    common_items: List[str]
    recyclability: str
    bin_color: str
    recycling_code: str
    general_tip: str
