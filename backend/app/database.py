import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import DATABASE_URL

logger = logging.getLogger("database")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency providing database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_initial_data_if_empty():
    """
    Populates baseline realistic demo records if database is empty.
    Ensures dashboard statistics, 7-day trend, and history are never blank
    even when running on ephemeral cloud containers (e.g. Render free tier restarts).
    """
    from datetime import datetime, timedelta
    import json
    from .models.classification import ClassificationRecord
    from .services.recommendation_engine import get_recommendation

    db = SessionLocal()
    try:
        count = db.query(ClassificationRecord).count()
        if count == 0:
            logger.info("Database is empty. Populating baseline demonstration records...")
            now = datetime.utcnow()
            seed_items = [
                {"name": "PET Mineral Water Bottle", "cat": "Plastic", "days": 5, "method": "ai", "conf": 0.94},
                {"name": "Corrugated Shipping Box", "cat": "Cardboard", "days": 4, "method": "ai", "conf": 0.92},
                {"name": "Aluminum Soda Can", "cat": "Metal", "days": 3, "method": "ai", "conf": 0.95},
                {"name": "Clear Glass Beverage Jar", "cat": "Glass", "days": 3, "method": "manual", "conf": None},
                {"name": "Printed Office Paper Sheets", "cat": "Paper", "days": 2, "method": "ai", "conf": 0.89},
                {"name": "Vegetable & Fruit Peels", "cat": "Organic", "days": 2, "method": "ai", "conf": 0.93},
                {"name": "USB Charging Cable & Wire", "cat": "E-Waste", "days": 1, "method": "ai", "conf": 0.87},
                {"name": "Tin Food Can", "cat": "Metal", "days": 1, "method": "ai", "conf": 0.91},
                {"name": "HDPE Milk Jug", "cat": "Plastic", "days": 0, "method": "ai", "conf": 0.92},
            ]
            for item in seed_items:
                rec = get_recommendation(item["cat"])
                record = ClassificationRecord(
                    item_name=item["name"],
                    category=item["cat"],
                    classification_method=item["method"],
                    confidence_score=item["conf"],
                    explanation=f"Identified as {item['cat']} based on surface texture, material profile, and structural traits.",
                    visual_features=json.dumps([f"Material Profile: {item['cat']}", "Verified Baseline Record"]),
                    image_filename=None,
                    image_path=None,
                    recyclability=rec.recyclability,
                    disposal_method=rec.disposal_method,
                    preparation_steps=json.dumps(rec.preparation_steps),
                    reuse_ideas=json.dumps(rec.reuse_ideas),
                    contamination_warnings=rec.contamination_warnings,
                    safety_precautions=rec.safety_precautions,
                    local_regulations_note=rec.local_regulations_note,
                    recycling_code=rec.recycling_code,
                    bin_color=rec.bin_color,
                    created_at=now - timedelta(days=item["days"], hours=2)
                )
                db.add(record)
            db.commit()
            logger.info("Successfully seeded 9 baseline records.")
    except Exception as e:
        logger.warning(f"Initial data seeding warning: {e}")
        db.rollback()
    finally:
        db.close()

def init_db():
    """Create all tables in the database and seed initial data if empty."""
    from .models import classification
    Base.metadata.create_all(bind=engine)
    seed_initial_data_if_empty()
