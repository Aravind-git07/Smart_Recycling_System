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
    recyclability = Column(String(50), nullable=False) # High, Moderate, Low, Non-Recyclable, Hazardous
    disposal_method = Column(Text, nullable=False)
    preparation_steps = Column(Text, nullable=False) # JSON array string
    reuse_ideas = Column(Text, nullable=False) # JSON array string
    contamination_warnings = Column(Text, nullable=False)
    safety_precautions = Column(Text, nullable=False)
    local_regulations_note = Column(Text, nullable=False)
    recycling_code = Column(String(50), nullable=True)
    bin_color = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
