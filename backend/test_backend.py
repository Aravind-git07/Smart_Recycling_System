import io
import sys
from PIL import Image
from app.database import init_db, SessionLocal
from app.services.recommendation_engine import get_recommendation, get_all_categories, normalize_category
from app.services.ai_classifier import analyze_image_pillow, classify_waste_image
from app.services.statistics_service import calculate_dashboard_stats
from app.models.classification import ClassificationRecord

def run_tests():
    print("[1/6] Testing database initialization...")
    init_db()
    print("Database initialized successfully.")

    print("[2/6] Testing recommendation engine...")
    rec = get_recommendation("Plastic", "PET Water Bottle")
    assert rec.category == "Plastic", f"Expected Plastic, got {rec.category}"
    assert len(rec.preparation_steps) > 0, "Expected preparation steps"
    assert rec.recyclability == "High", f"Expected High, got {rec.recyclability}"
    print(f"Recommendation test passed: {rec.item_name} -> {rec.category} ({rec.recyclability})")

    print("[3/6] Testing category normalization...")
    assert normalize_category("soda can") == "Metal"
    assert normalize_category("corrugated cardboard") == "Cardboard"
    assert normalize_category("newspaper") == "Paper"
    assert normalize_category("poly bag") == "Plastic"
    print("Normalization test passed.")

    print("[4/6] Testing offline CV classification on synthetic test image...")
    # Create a 200x200 synthetic image
    img = Image.new("RGB", (200, 200), color=(50, 120, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    result = classify_waste_image(img_bytes, filename="plastic_bottle_sample.jpg")
    assert result["category"] == "Plastic", f"Expected Plastic, got {result['category']}"
    assert result["confidence_score"] > 0.0, "Expected positive confidence score"
    print(f"Vision test passed: {result['item_name']} -> {result['category']} (Confidence: {result['confidence_score']})")

    print("[5/6] Testing invalid image rejection...")
    try:
        classify_waste_image(b"not-an-image-data", filename="fake.jpg")
        assert False, "Should have thrown ValueError"
    except ValueError as ve:
        print(f"Invalid image correctly rejected: {ve}")

    print("[6/6] Testing database persistence and dashboard statistics...")
    db = SessionLocal()
    try:
        # Add a record
        rec_db = ClassificationRecord(
            item_name="PET Water Bottle",
            category="Plastic",
            classification_method="ai",
            confidence_score=0.88,
            explanation="Test explanation",
            visual_features="[\"synthetic polymer\"]",
            image_filename="test.jpg",
            image_path="test.jpg",
            recyclability=rec.recyclability,
            disposal_method=rec.disposal_method,
            preparation_steps="[\"Rinse bottle\"]",
            reuse_ideas="[\"Planter\"]",
            contamination_warnings="Keep caps separated",
            safety_precautions="Do not burn",
            local_regulations_note="Standard #1 PET curbside",
            recycling_code="#1 PET",
            bin_color="Blue"
        )
        db.add(rec_db)
        db.commit()

        stats = calculate_dashboard_stats(db)
        assert stats.total_classifications >= 1, f"Expected at least 1, got {stats.total_classifications}"
        assert stats.ai_classifications >= 1, f"Expected at least 1 AI classification"
        assert "Plastic" in stats.category_counts
        print(f"Dashboard stats verified: Total={stats.total_classifications}, AI={stats.ai_classifications}, Categories={stats.category_counts}")
    finally:
        db.close()

    print("\nALL BACKEND UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
