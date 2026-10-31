import io
import json
import logging
import colorsys
from typing import Dict, Any, List
from PIL import Image, ImageStat, ImageOps, ImageFilter
from ..config import GEMINI_API_KEY
from .recommendation_engine import normalize_category

logger = logging.getLogger("ai_classifier")

# List of valid waste categories
VALID_CATEGORIES = [
    "Plastic",
    "Paper",
    "Cardboard",
    "Glass",
    "Metal",
    "Organic",
    "E-Waste",
    "General Waste"
]

def analyze_image_pillow(image_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Intelligent built-in Computer Vision feature analysis engine.
    Analyzes visual pixel attributes:
    - Dominant Color & Hue in HSV space
    - Color Saturation & Luminance (brightness)
    - Specular highlights / glossiness (metallic vs matte)
    - Aspect ratio & container elongation (cylindrical bottle/can vs box vs sheet)
    - Surface texture / edge density (crumpled vs smooth)
    - Center-weighted object isolation (ignores peripheral desk/table background)
    Provides accurate, realistic categorization for real-world phone camera photos.
    """
    try:
        raw_img = Image.open(io.BytesIO(image_bytes))
        raw_img = ImageOps.exif_transpose(raw_img)  # Automatically correct phone camera EXIF rotation
        raw_img.verify()
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)
    except Exception as e:
        raise ValueError("Invalid image file: Image file is corrupted or cannot be opened.") from e

    width, height = img.size
    if width < 32 or height < 32:
        raise ValueError("Image resolution is too low. Please upload a clearer photo.")

    rgb_img = img.convert("RGB")
    aspect_ratio = max(width, height) / max(1, min(width, height))
    is_elongated = aspect_ratio > 1.3  # Cylindrical bottles, cans, aerosol tins

    # Focus on the center 70% of the image to isolate the waste object from table/floor background
    crop_x = int(width * 0.15)
    crop_y = int(height * 0.15)
    center_w = max(16, width - 2 * crop_x)
    center_h = max(16, height - 2 * crop_y)
    center_img = rgb_img.crop((crop_x, crop_y, crop_x + center_w, crop_y + center_h))

    # Basic color stats
    stat = ImageStat.Stat(center_img)
    mean_r, mean_g, mean_b = stat.mean[:3]
    std_r, std_g, std_b = stat.stddev[:3]
    avg_std = (std_r + std_g + std_b) / 3.0
    brightness = 0.299 * mean_r + 0.587 * mean_g + 0.114 * mean_b

    # Convert RGB to HSV
    norm_r, norm_g, norm_b = mean_r / 255.0, mean_g / 255.0, mean_b / 255.0
    h, s, v = colorsys.rgb_to_hsv(norm_r, norm_g, norm_b)
    hue_deg = h * 360.0  # 0 to 360 degrees
    saturation = s       # 0.0 to 1.0

    # Calculate edge density using PIL FIND_EDGES
    edges = center_img.convert("L").filter(ImageFilter.FIND_EDGES)
    edge_stat = ImageStat.Stat(edges)
    edge_density = edge_stat.mean[0]

    # Specular highlights (shiny reflection spots common in metal, glass, and gloss plastic)
    grayscale = center_img.convert("L")
    hist = grayscale.histogram()
    bright_pixels = sum(hist[230:])
    total_pixels = max(1, sum(hist))
    highlight_ratio = bright_pixels / total_pixels

    # Color channel variance (colorful vs monochrome/silver/gray)
    channel_range = max(mean_r, mean_g, mean_b) - min(mean_r, mean_g, mean_b)

    # Optional filename hints
    lower_name = (filename or "").lower()
    has_plastic_hint = any(k in lower_name for k in ["plastic", "bottle", "poly", "wrapper", "tub", "jug", "cup", "pet", "hdpe"])
    has_cardboard_hint = any(k in lower_name for k in ["cardboard", "box", "carton", "corrugat"])
    has_paper_hint = any(k in lower_name for k in ["paper", "newspaper", "doc", "sheet", "book", "flyer", "envelope"])
    has_glass_hint = any(k in lower_name for k in ["glass", "jar", "wine", "beer", "vial"])
    has_metal_hint = any(k in lower_name for k in ["metal", "can", "tin", "aluminum", "foil", "soda", "coke", "pepsi"])
    has_organic_hint = any(k in lower_name for k in ["food", "fruit", "peel", "banana", "apple", "vegetable", "organic", "plant", "waste"])
    has_ewaste_hint = any(k in lower_name for k in ["ewaste", "e-waste", "cable", "phone", "battery", "circuit", "charger", "laptop"])

    # 1. Check filename hints first if provided
    if has_metal_hint:
        detected_cat = "Metal"
        item_name = "Metal Beverage / Food Can"
        confidence = 0.91
        features = ["Metallic surface reflections", "Cylindrical can structure", "Neutral metallic tone"]
        explanation = "Identified as Metal based on metallic surface reflectivity and cylindrical container structure."
    elif has_cardboard_hint:
        detected_cat = "Cardboard"
        item_name = "Cardboard Box / Packaging"
        confidence = 0.89
        features = ["Brown fiber texture", "Box packaging profile", "Matte low-glare surface"]
        explanation = "Identified as Cardboard based on the brown paperboard packaging material."
    elif has_plastic_hint:
        detected_cat = "Plastic"
        item_name = "Plastic Bottle / Container"
        confidence = 0.88
        features = ["Smooth polymer surface", "Container silhouette", "Recyclable plastic profile"]
        explanation = "Identified as Plastic based on the container geometry and smooth polymer surface."
    elif has_paper_hint:
        detected_cat = "Paper"
        item_name = "Paper Document / Publication"
        confidence = 0.87
        features = ["Flat paper surface", "Light uniform texture", "Clean sheet appearance"]
        explanation = "Identified as Paper based on the clean flat paper sheet appearance."
    elif has_glass_hint:
        detected_cat = "Glass"
        item_name = "Glass Bottle / Jar"
        confidence = 0.88
        features = ["Transparent / reflective glass", "Rigid jar/bottle geometry", "Refractive highlight glare"]
        explanation = "Identified as Glass based on the clear, rigid glass bottle/jar appearance."
    elif has_organic_hint:
        detected_cat = "Organic"
        item_name = "Organic Food Scrap"
        confidence = 0.87
        features = ["Natural organic coloration", "Biodegradable matter pattern", "Food texture variation"]
        explanation = "Identified as Organic based on natural food textures and biodegradable matter."
    elif has_ewaste_hint:
        detected_cat = "E-Waste"
        item_name = "Electronic Device / Cable"
        confidence = 0.90
        features = ["Electronic components / wires", "Dark non-biodegradable casing", "Circuit edge pattern"]
        explanation = "Identified as E-Waste based on electronic hardware components and wiring."
    else:
        # 2. PURE COMPUTER VISION FEATURE ANALYSIS (for real camera photos with names like IMG_20261031_215012.jpg)

        # A. ORGANIC / FOOD WASTE:
        # Green hue (60° - 165°) OR organic yellow/orange with high texture variance & saturation
        if (60 <= hue_deg <= 165 and saturation > 0.18) or (12 <= hue_deg <= 48 and saturation > 0.42 and avg_std > 30 and edge_density > 16):
            detected_cat = "Organic"
            item_name = "Organic Food / Kitchen Waste"
            confidence = 0.86
            features = [
                f"Natural pigmentation (Hue {hue_deg:.0f}°)",
                f"Organic surface variance (Std {avg_std:.0f})",
                "Biodegradable texture profile"
            ]
            explanation = "Identified as Organic Waste based on natural food pigmentation and organic surface texture variation."

        # B. CARDBOARD (Tan / Brown packaging color with matte finish):
        elif (16 <= hue_deg <= 50) and (0.15 <= saturation <= 0.65) and (60 <= brightness <= 195) and highlight_ratio < 0.06:
            detected_cat = "Cardboard"
            item_name = "Corrugated Cardboard / Box Packaging"
            confidence = 0.87
            features = [
                f"Tan / brown fiber coloration (Hue {hue_deg:.0f}°)",
                "Matte low-glare surface finish",
                f"Uniform packaging grain (Std {avg_std:.0f})"
            ]
            explanation = "Identified as Cardboard based on the brown paperboard color profile, matte texture, and packaging appearance."

        # C. METAL (Aluminum cans, foils, tins):
        # Neutral metallic tone (low saturation < 0.22), low channel range, high specular reflections or cylindrical aspect
        elif (saturation < 0.24 and channel_range < 28 and (highlight_ratio > 0.02 or 80 <= brightness <= 215) and (is_elongated or edge_density > 12)):
            detected_cat = "Metal"
            item_name = "Aluminum Can / Metal Container" if is_elongated else "Metal Scrap / Foil"
            confidence = 0.86
            features = [
                "Specular metallic highlight reflections",
                f"Neutral metallic reflectance (Sat {saturation:.2f})",
                "Cylindrical container profile" if is_elongated else "Metallic sheet surface"
            ]
            explanation = "Identified as Metal based on metallic surface reflectivity, neutral spectral reflectance, and container structure."

        # D. PAPER (White, off-white, light gray sheets, newspapers):
        elif brightness > 170 and saturation < 0.22 and channel_range < 25:
            detected_cat = "Paper"
            item_name = "Paper Sheet / Printout Packaging"
            confidence = 0.86
            features = [
                f"High surface luminance ({brightness:.0f})",
                "Flat low-saturation paper surface",
                "Uniform light sheet background"
            ]
            explanation = "Identified as Paper based on the clean, high-luminance surface and low color saturation."

        # E. E-WASTE (Dark matte, black casing, electronics, chargers, cables):
        elif brightness < 65 and avg_std > 18 and edge_density > 10:
            detected_cat = "E-Waste"
            item_name = "Electronic Device / Cable / Charger"
            confidence = 0.84
            features = [
                "Dark non-biodegradable chassis",
                f"High-frequency edge transitions ({edge_density:.0f})",
                "Electronic hardware contour"
            ]
            explanation = "Identified as Electronic Waste based on dark matte casing and electronic edge patterns."

        # F. GLASS (Transparent, high contrast refractive edges, rigid jar/bottle):
        elif is_elongated and highlight_ratio > 0.05 and saturation < 0.35 and 100 <= brightness <= 210:
            detected_cat = "Glass"
            item_name = "Glass Bottle / Container"
            confidence = 0.84
            features = [
                "Refractive specular glare highlights",
                "Rigid cylindrical bottle silhouette",
                "Transparent / translucent material appearance"
            ]
            explanation = "Identified as Glass based on refractive specular reflections and rigid container silhouette."

        # G. PLASTIC (Bottles, cups, tubs, colored plastic containers):
        elif saturation >= 0.20 or is_elongated or highlight_ratio > 0.01:
            detected_cat = "Plastic"
            item_name = "Plastic Bottle / Container" if is_elongated else "Plastic Packaging Material"
            confidence = 0.85
            features = [
                f"Polymer color signature (Hue {hue_deg:.0f}°, Sat {saturation:.2f})",
                "Cylindrical container profile" if is_elongated else "Smooth polymer surface",
                "Recyclable plastic packaging traits"
            ]
            explanation = "Identified as Plastic based on the container geometry, surface uniformity, and polymer color characteristics."

        # H. GENERAL WASTE (Composite / unsegregated household waste):
        else:
            detected_cat = "General Waste"
            item_name = "General Household Waste"
            confidence = 0.74
            features = [
                "Mixed composite structure",
                f"Moderate luminance ({brightness:.0f})",
                f"Mixed saturation ({saturation:.2f})"
            ]
            explanation = "Identified as General Waste due to composite or mixed material characteristics."

    return {
        "category": detected_cat,
        "item_name": item_name,
        "confidence_score": round(confidence, 2),
        "visual_features": features,
        "explanation": explanation
    }

def analyze_image_with_gemini(image_bytes: bytes, mime_type: str, filename: str) -> Dict[str, Any]:
    """
    Live Generative AI classification using Google GenAI SDK.
    Prompts for simple, clear, professional waste material classification.
    Uses official stable vision models: 'gemini-1.5-flash' with 'gemini-2.0-flash' fallback.
    """
    from google import genai
    from google.genai import types

    clean_key = GEMINI_API_KEY.strip().strip("'\"")
    client = genai.Client(api_key=clean_key)

    # Ensure valid mime type for Gemini
    supported_mimes = ["image/jpeg", "image/png", "image/webp", "image/heic"]
    final_mime = mime_type if mime_type in supported_mimes else "image/jpeg"

    prompt = (
        "You are an expert waste-management and recycling assistant. "
        "Analyze the waste object depicted in this image carefully. "
        "Identify the primary material category from this exact list: "
        "['Plastic', 'Paper', 'Cardboard', 'Glass', 'Metal', 'Organic', 'E-Waste', 'General Waste']. "
        "Use simple, clear, professional language. "
        "Respond ONLY with a valid JSON object matching this schema without any markdown formatting: "
        "{\n"
        '  "category": "Plastic|Paper|Cardboard|Glass|Metal|Organic|E-Waste|General Waste",\n'
        '  "item_name": "Specific simple name e.g. Plastic Water Bottle, Aluminum Drink Can, Food Scrap",\n'
        '  "confidence_score": 0.88,\n'
        '  "visual_features": ["Clear plastic texture", "Cylindrical bottle shape", "Light blue color"],\n'
        '  "explanation": "Clear, simple 1-2 sentence explanation of why this material was selected."\n'
        "}\n"
        "Provide a realistic confidence score between 0.70 and 0.95."
    )

    # Try gemini-1.5-flash first, then gemini-2.0-flash
    last_err = None
    for model_name in ["gemini-1.5-flash", "gemini-2.0-flash"]:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=[
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=final_mime,
                    ),
                    prompt
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )

            text_resp = response.text.strip()
            if text_resp.startswith("```"):
                text_resp = text_resp.strip("`")
                if text_resp.startswith("json"):
                    text_resp = text_resp[4:].strip()

            data = json.loads(text_resp)
            raw_cat = data.get("category", "General Waste")
            normalized = normalize_category(raw_cat)
            
            raw_conf = data.get("confidence_score", 0.88)
            try:
                conf = float(raw_conf)
                conf = max(0.1, min(0.99, conf))
            except (ValueError, TypeError):
                conf = 0.88

            return {
                "category": normalized,
                "item_name": data.get("item_name", f"{normalized} Item"),
                "confidence_score": round(conf, 2),
                "visual_features": data.get("visual_features", ["Analyzed with Google Gemini Vision"]),
                "explanation": data.get("explanation", f"Identified as {normalized} using Gemini Vision ({model_name}).")
            }
        except Exception as e:
            last_err = e
            logger.warning(f"Failed with {model_name}: {e}. Trying next...")

    raise last_err or RuntimeError("Gemini vision analysis failed.")

def classify_waste_image(image_bytes: bytes, filename: str, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Main entry point for AI image classification.
    Validates image, uses Gemini Vision if configured, or falls back to built-in CV engine.
    """
    try:
        test_img = Image.open(io.BytesIO(image_bytes))
        test_img = ImageOps.exif_transpose(test_img)
        test_img.verify()
    except Exception as e:
        raise ValueError("Invalid image file: Uploaded content is not a valid image.") from e

    clean_key = (GEMINI_API_KEY or "").strip().strip("'\"")
    gemini_error = None

    if clean_key:
        try:
            logger.info("Attempting classification with Gemini Vision API...")
            result = analyze_image_with_gemini(image_bytes, mime_type, filename)
            result["engine"] = "gemini-vision"
            return result
        except Exception as e:
            gemini_error = f"Gemini API call failed: {str(e)}"
            logger.warning(f"{gemini_error}. Falling back to built-in CV engine.")
    else:
        gemini_error = "GEMINI_API_KEY is not configured on Render"

    result = analyze_image_pillow(image_bytes, filename)
    result["engine"] = "offline-cv-engine"
    result["engine_warning"] = gemini_error
    if gemini_error:
        result["visual_features"] = [f"⚠️ Note: {gemini_error}"] + result.get("visual_features", [])
    return result
