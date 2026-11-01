from typing import Dict, Any, List, Optional
from ..schemas.classification import RecommendationDetail, WasteCategoryDetail

# Simplified, professional, and clear domain knowledge base
CATEGORY_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "Plastic": {
        "name": "Plastic",
        "description": "Plastic bottles, food containers, jugs, and packaging materials.",
        "common_items": ["Water Bottles (PET #1)", "Milk & Detergent Jugs (HDPE #2)", "Food Containers (PP #5)", "Clean Plastic Bags"],
        "recyclability": "High",
        "bin_color": "Blue / Yellow",
        "recycling_code": "RIC #1 - #7",
        "general_tip": "Check the number inside the recycling triangle on the bottom of the container.",
        "default_item_name": "Plastic Container / Packaging",
        "disposal_method": "Place in the dry recyclables bin (usually blue or yellow bin). Ensure it is empty and free of food or liquids.",
        "preparation_steps": [
            "Empty all liquids or food completely.",
            "Rinse with clean water to remove sticky liquids, grease, or sauces.",
            "Crush the bottle or container flat to save space in the recycling bin.",
            "Put the cap back on tightly, or recycle separately if required by local rules.",
            "Remove any outer loose plastic film or labels if they peel off easily."
        ],
        "reuse_ideas": [
            "Use clean plastic jugs as plant watering cans or seedling pots with small drainage holes.",
            "Use sturdy containers to organize small tools, screws, nails, or stationery.",
            "Make simple DIY bird feeders or small indoor plant pots.",
            "Reuse clean plastic containers for dry household storage."
        ],
        "contamination_warnings": "Leftover food, oils, and milk spoil entire batches of recycled plastic. Soft plastic bags, thin wraps, and grocery bags should not be mixed with hard plastic bottles because they get caught in sorting machinery.",
        "safety_precautions": "Never burn plastic. Burning releases harmful toxic smoke and chemicals. Be careful with sharp edges when cutting plastic containers.",
        "local_regulations_note": "Most local recycling centers collect rigid bottles marked #1 (PET) and #2 (HDPE). Thin styrofoam (#6) and mixed plastics (#7) are often not accepted curbside. Check your local municipal guidelines."
    },
    "Paper": {
        "name": "Paper",
        "description": "Dry paper products such as newspapers, office sheets, books, notebooks, and envelopes.",
        "common_items": ["Office Printing Paper", "Newspapers & Magazines", "Notebooks & Envelopes", "Paper Bags"],
        "recyclability": "High",
        "bin_color": "Blue",
        "recycling_code": "PAP 20 - 22",
        "general_tip": "Keep paper completely dry. Wet paper cannot be recycled and rots quickly.",
        "default_item_name": "Paper Document / Publication",
        "disposal_method": "Place in the dry paper recycling bin. Keep flat and dry; do not crumple into tight balls.",
        "preparation_steps": [
            "Make sure the paper is completely dry and free from food stains or oil.",
            "Remove plastic covers, spiral bindings, and large metal binder clips.",
            "Standard small staples are fine to leave in place.",
            "Remove transparent plastic address windows from envelopes if easy to tear off.",
            "Keep sheets flat in bundles or in a paper bag for easy collection."
        ],
        "reuse_ideas": [
            "Use the blank back side of printed sheets for notes, rough sketches, or draft lists.",
            "Shred clean unprinted paper to use as soft packing material for parcels.",
            "Use old newspapers to clean glass windows or line pet trays.",
            "Add plain unprinted paper scraps to garden compost as brown carbon material."
        ],
        "contamination_warnings": "Paper with cooking oil (such as greasy pizza boxes), shiny wax paper, paper towels, and thermal store receipts cannot be recycled in the paper bin.",
        "safety_precautions": "Be careful when handling large stacks of paper to avoid paper cuts. Store dry paper away from heaters and open flames.",
        "local_regulations_note": "Paper must be kept separate from wet kitchen waste. Wet or moldy paper will be rejected by collection centers and sent to regular trash."
    },
    "Cardboard": {
        "name": "Cardboard",
        "description": "Corrugated shipping boxes, cereal cartons, shoe boxes, and packaging boards.",
        "common_items": ["Shipping Delivery Boxes", "Cereal & Food Boxes", "Shoe Boxes", "Packing Cartons"],
        "recyclability": "High",
        "bin_color": "Blue / Brown",
        "recycling_code": "PAP 20 / PAP 21",
        "general_tip": "Always flatten boxes to save space in the collection truck and bin.",
        "default_item_name": "Cardboard Box / Packaging",
        "disposal_method": "Flatten boxes completely and place them into the cardboard recycling bin or tie them into a neat bundle.",
        "preparation_steps": [
            "Flatten and break down all cardboard boxes so they lay flat.",
            "Take out all plastic bubble wrap, thermocol foam, and air pillows.",
            "Peel off heavy plastic shipping tape and labels when possible.",
            "Cut large boxes down so they fit easily inside the collection bin.",
            "Keep boxes dry—do not leave them outdoors in the rain."
        ],
        "reuse_ideas": [
            "Save strong boxes for home storage, moving, or shipping parcels.",
            "Lay flat cardboard on garden soil to naturally stop weed growth.",
            "Use as floor protection during house painting or home repairs.",
            "Make simple toys, playhouses, or scratching pads for pets."
        ],
        "contamination_warnings": "Cardboard soaked with food grease (like the oily bottom of a pizza box) or motor oil cannot be recycled. Tear off the clean top lid for recycling and discard the oily part in general trash.",
        "safety_precautions": "Use a utility knife carefully when cutting thick boxes; always cut away from yourself. Wear simple work gloves to protect your hands.",
        "local_regulations_note": "Many cities require cardboard boxes to be flattened by law. Wet cardboard is not accepted at paper recycling mills."
    },
    "Glass": {
        "name": "Glass",
        "description": "Glass beverage bottles, food jars, cosmetic bottles, and condiment containers.",
        "common_items": ["Glass Beverage Bottles", "Pickle & Sauce Jars", "Cosmetic Bottles", "Jam Jars"],
        "recyclability": "High",
        "bin_color": "Green / Clear Glass Drop-off",
        "recycling_code": "GL 70 (Clear) / 71 (Green) / 72 (Brown)",
        "general_tip": "Glass can be melted and recycled forever without losing quality.",
        "default_item_name": "Glass Bottle / Container Jar",
        "disposal_method": "Place in the designated glass bin or local bottle bank. Do not break the glass before disposal.",
        "preparation_steps": [
            "Empty all liquids and food contents from the bottle or jar.",
            "Rinse quickly with water to prevent bad odors and keep pests away.",
            "Remove metal lids or plastic caps and place them in their own recycling bins.",
            "Paper labels can stay on; they burn away safely in recycling furnaces.",
            "Do not break or smash the bottle before placing it in the bin."
        ],
        "reuse_ideas": [
            "Clean and sterilize glass jars to store spices, pulses, rice, or homemade food.",
            "Use attractive bottles as flower vases, water carafes, or table decor.",
            "Use wide jars to store stationery, buttons, screws, or coins.",
            "Make simple DIY candle holders or small plant terrariums."
        ],
        "contamination_warnings": "Never mix drinking glasses, ceramic cups, oven-safe dishes (Pyrex), mirrors, or window glass with bottle glass. These melt at completely different temperatures and ruin new glass bottles.",
        "safety_precautions": "Handle glass carefully to prevent breakage. If handling broken glass, wear thick gloves and wrap broken pieces in newspaper before discarding.",
        "local_regulations_note": "Some regions offer cash refunds for clean bottles at collection kiosks. Other areas ask for glass to be separated by color (clear, green, brown)."
    },
    "Metal": {
        "name": "Metal",
        "description": "Aluminum drink cans, steel food tins, aerosol cans, and aluminum foil trays.",
        "common_items": ["Aluminum Soda & Juice Cans", "Steel / Tin Food Cans", "Aluminum Foil & Trays", "Metal Bottle Caps"],
        "recyclability": "High",
        "bin_color": "Grey / Blue",
        "recycling_code": "ALU 41 (Aluminum) / FE 40 (Steel)",
        "general_tip": "Recycling aluminum uses 95% less energy than making new metal from raw ore.",
        "default_item_name": "Metal Can / Container",
        "disposal_method": "Place in the metal recycling bin or mixed recyclables bin.",
        "preparation_steps": [
            "Empty all liquids or food residues from the can.",
            "Rinse the can with a little water to keep it clean and odor-free.",
            "Push any sharp opened lids down inside the tin can to prevent cuts.",
            "For aluminum foil, wipe off heavy food grease and scrunch it into a small ball.",
            "Make sure spray cans (deodorant, aerosol) are completely empty before recycling."
        ],
        "reuse_ideas": [
            "Clean tin cans work great as desk pen holders, brush caddies, or cutlery holders.",
            "Use larger cans to organize garage tools, nails, and screws.",
            "Punch small holes in empty cans to make simple garden lanterns or plant pots.",
            "Make simple DIY plant pots for small indoor herbs."
        ],
        "contamination_warnings": "Never place partially full spray cans (containing gas or chemicals) into recycling bins—they can burst in compactor trucks. Do not mix chemical cans, paint cans, or engine oil cans with food cans.",
        "safety_precautions": "Watch out for sharp metal edges on opened cans and lids. Never heat or puncture closed spray cans.",
        "local_regulations_note": "Metal cans are separated easily at recycling plants using magnets (for steel) and air/electric sorting (for aluminum). Both metals have high resale value."
    },
    "Organic": {
        "name": "Organic",
        "description": "Kitchen food scraps, fruit and vegetable peels, coffee grounds, eggshells, and garden leaves.",
        "common_items": ["Fruit & Vegetable Peels", "Leftover Food & Cooked Scraps", "Coffee Grounds & Tea Powder", "Eggshells & Garden Leaves"],
        "recyclability": "Moderate",
        "bin_color": "Green (Wet Waste)",
        "recycling_code": "COMPOST",
        "general_tip": "Separate wet food waste from dry trash so it can be made into rich compost.",
        "default_item_name": "Organic Food / Plant Waste",
        "disposal_method": "Put into the green wet-waste bin, community compost pit, or your home garden compost bin.",
        "preparation_steps": [
            "Remove plastic stickers from fruits (like apple stickers) and take off rubber bands.",
            "Drain excess liquid, gravies, or soups before throwing into the bin.",
            "Chop large fruit rinds (like watermelon) into smaller chunks so they break down faster.",
            "Use a compostable paper bag or newspaper to line your kitchen bin—never a plastic bag."
        ],
        "reuse_ideas": [
            "Turn kitchen scraps into nutrient-rich organic compost for home plants and gardens.",
            "Mix used coffee grounds directly into garden soil for roses and acid-loving plants.",
            "Boil clean vegetable peels (carrot, onion, potato) to make fresh vegetable broth.",
            "Feed fresh, safe vegetable trimmings to backyard pets or livestock where suitable."
        ],
        "contamination_warnings": "Never mix plastic bags, plastic wrappers, synthetic tea bags, or chemically treated pet waste with food waste. Plastic does not decompose and ruins compost.",
        "safety_precautions": "Wash hands with soap after handling compost or decomposing waste. Keep your kitchen scrap bin covered to keep fruit flies away.",
        "local_regulations_note": "Many cities require wet waste to be separated from dry waste by law. Sending wet waste to landfills creates strong methane gas and causes foul landfill fires."
    },
    "E-Waste": {
        "name": "E-Waste",
        "description": "Old electrical and electronic items like chargers, cables, phones, batteries, keyboards, and gadgets.",
        "common_items": ["Old Phones & Tablets", "Charging Cables & Adapters", "Batteries (AA, AAA, Lithium)", "Computer Mice & Keyboards", "Small Electronic Toys"],
        "recyclability": "High",
        "bin_color": "Red / Dedicated E-Waste Drop-off",
        "recycling_code": "E-CYCLE",
        "general_tip": "Never throw electronics or batteries in the regular trash bin.",
        "default_item_name": "Electronic Device / E-Waste Item",
        "disposal_method": "Drop off at an authorized electronics collection point, store take-back kiosk, or municipal e-waste center.",
        "preparation_steps": [
            "Back up personal files and perform a factory reset to erase private data.",
            "Remove SIM cards, memory cards, and phone cases.",
            "Remove detachable batteries if possible.",
            "Put a small piece of tape over battery ends to prevent accidental short circuits.",
            "Neatly tie cables and do not smash or break device screens."
        ],
        "reuse_ideas": [
            "Donate working phones and computers to students, schools, or charities.",
            "Repurpose an old smartphone as a home security camera, digital clock, or music player.",
            "Trade in working devices for discounts on newer models through exchange programs.",
            "Keep working cables and chargers as spares for family and guests."
        ],
        "contamination_warnings": "Electronics contain lead, mercury, and other heavy metals. If thrown in regular trash, these metals leak into underground water tables and harm the environment.",
        "safety_precautions": "FIRE RISK: Swollen, damaged, or punctured batteries can catch fire quickly. Never puncture batteries. Keep loose batteries in a dry, safe container.",
        "local_regulations_note": "Electronics are governed by official E-Waste Management Rules. Selling to authorized certified recyclers ensures safe recovery of valuable copper, gold, and plastic."
    },
    "General Waste": {
        "name": "General Waste",
        "description": "Mixed, dirty, or non-recyclable household items like chip packets, used tissues, and broken ceramics.",
        "common_items": ["Multi-layer Chip & Snack Wrappers", "Used Tissues & Wipes", "Broken Ceramic Mugs", "Diapers & Sanitary Waste", "Dirty Composite Packaging"],
        "recyclability": "Non-Recyclable",
        "bin_color": "Black / Grey (Landfill)",
        "recycling_code": "LANDFILL",
        "general_tip": "Try to reduce single-use packaging and carry reusable bags when shopping.",
        "default_item_name": "General Household Waste Item",
        "disposal_method": "Place in the black or grey general waste bin for safe landfill disposal or municipal waste-to-energy processing.",
        "preparation_steps": [
            "Make sure no clean recyclables (paper, plastic bottles, metal cans) are mixed inside.",
            "Wrap sanitary waste securely in newspaper or a disposal bag.",
            "Tie garbage bags tightly before placing in the outdoor bin to prevent animal scavenging.",
            "Drain any liquids before bagging to reduce trash weight and leakage."
        ],
        "reuse_ideas": [
            "Use broken ceramics as drainage stones at the very bottom of garden flower pots.",
            "Audit your weekly trash to see which single-use plastic items you can replace with reusable alternatives.",
            "Repurpose sturdy plastic shopping bags as small trash can liners."
        ],
        "contamination_warnings": "Keep batteries, light bulbs, electronics, and strong household chemicals OUT of the general trash bin. These need special disposal.",
        "safety_precautions": "Wrap sharp broken ceramics or glass shards securely in newspaper before placing them in the bag so sanitation workers do not get hurt.",
        "local_regulations_note": "General waste is sent to engineered landfills or municipal waste-to-energy plants. Segregating recyclables before discarding helps reduce landfill burden."
    }
}

# Category synonyms and alias normalization map
CATEGORY_ALIASES = {
    "plastic": "Plastic",
    "plastics": "Plastic",
    "pet": "Plastic",
    "hdpe": "Plastic",
    "poly": "Plastic",
    "bag": "Plastic",
    "plastic bag": "Plastic",
    "bottle": "Plastic",
    "plastic bottle": "Plastic",
    "polythene": "Plastic",
    "paper": "Paper",
    "papers": "Paper",
    "document": "Paper",
    "newspaper": "Paper",
    "magazine": "Paper",
    "cardboard": "Cardboard",
    "carton": "Cardboard",
    "corrugated": "Cardboard",
    "box": "Cardboard",
    "glass": "Glass",
    "glass bottle": "Glass",
    "glass jar": "Glass",
    "cullet": "Glass",
    "metal": "Metal",
    "tin": "Metal",
    "aluminum": "Metal",
    "can": "Metal",
    "steel": "Metal",
    "soda can": "Metal",
    "organic": "Organic",
    "food": "Organic",
    "wet waste": "Organic",
    "compostable": "Organic",
    "biodegradable": "Organic",
    "e-waste": "E-Waste",
    "ewaste": "E-Waste",
    "electronic": "E-Waste",
    "battery": "E-Waste",
    "cable": "E-Waste",
    "general waste": "General Waste",
    "general": "General Waste",
    "trash": "General Waste",
    "landfill": "General Waste",
    "non-recyclable": "General Waste"
}

def normalize_category(raw_name: str) -> str:
    """Normalize user input or AI predictions to one of the canonical categories."""
    clean = raw_name.strip().lower()
    if clean in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[clean]
    for alias, canonical in CATEGORY_ALIASES.items():
        if alias in clean:
            return canonical
    return "General Waste"

def get_recommendation(category: str, item_name: Optional[str] = None) -> RecommendationDetail:
    """
    Retrieve simple, professional recycling, preparation, safety, and local regulation recommendations
    for a given waste category and optional specific item.
    """
    canonical_category = normalize_category(category)
    data = CATEGORY_KNOWLEDGE_BASE.get(canonical_category, CATEGORY_KNOWLEDGE_BASE["General Waste"])
    
    final_item_name = item_name.strip() if item_name and item_name.strip() else data["default_item_name"]
    
    return RecommendationDetail(
        category=data["name"],
        item_name=final_item_name,
        recyclability=data["recyclability"],
        disposal_method=data["disposal_method"],
        preparation_steps=data["preparation_steps"],
        reuse_ideas=data["reuse_ideas"],
        contamination_warnings=data["contamination_warnings"],
        safety_precautions=data["safety_precautions"],
        local_regulations_note=data["local_regulations_note"],
        recycling_code=data["recycling_code"],
        bin_color=data["bin_color"]
    )

def infer_category_from_text(text: str) -> Optional[str]:
    """
    Infers waste material category from item name or description keywords.
    E.g. 'coke tin' -> 'Metal', 'glass jar' -> 'Glass', 'cereal box' -> 'Cardboard'.
    """
    if not text:
        return None
    lower = text.lower().strip()

    # Metal detection (tin, can, aluminum, steel, brass, foil)
    if any(k in lower for k in ["tin", "coke", "pepsi", "soda can", "aluminum", "aluminium", "foil", "steel", "metal", "iron", "copper", "brass"]):
        if "trash can" not in lower and "garbage can" not in lower:
            return "Metal"
    if " can" in lower or lower.startswith("can ") or lower == "can":
        if "trash can" not in lower and "garbage can" not in lower:
            return "Metal"

    # Glass detection (glass, jar, pickle, mason, cullet, mirror, wine bottle)
    if any(k in lower for k in ["glass", "jar", "pickle", "mason", "cullet", "mirror", "wine bottle", "beer bottle", "champagne bottle"]):
        return "Glass"

    # Cardboard detection (box, carton, corrugated, cardboard, packaging)
    if any(k in lower for k in ["cardboard", "box", "carton", "corrugated", "cereal box", "shoe box", "pizza box"]):
        return "Cardboard"

    # Paper detection (paper, newspaper, book, notebook, magazine, envelope, receipt)
    if any(k in lower for k in ["paper", "newspaper", "magazine", "book", "notebook", "receipt", "envelope", "printout", "leaflet", "pamphlet"]):
        return "Paper"

    # E-Waste detection (cable, charger, wire, phone, laptop, battery, circuit, usb)
    if any(k in lower for k in ["e-waste", "ewaste", "cable", "charger", "wire", "battery", "phone", "laptop", "circuit", "usb", "adapter", "electronic", "keyboard", "mouse", "headphone"]):
        return "E-Waste"

    # Organic detection (food, fruit, peel, vegetable, banana, apple, organic, scrap, compost)
    if any(k in lower for k in ["food", "fruit", "vegetable", "peel", "banana", "apple", "bread", "scrap", "leaf", "plant", "organic", "tea bag", "coffee ground", "egg"]):
        return "Organic"

    # Plastic detection (plastic, bottle, jug, tub, pet, hdpe, pvc, polymer, tupperware)
    if any(k in lower for k in ["plastic", "water bottle", "shampoo", "bottle", "jug", "tub", "container", "pvc", "pet", "hdpe", "polymer", "polyethylene", "polystyrene", "tupperware"]):
        return "Plastic"

    return None

def get_all_categories() -> List[WasteCategoryDetail]:
    """Retrieve full catalog of supported categories for UI selector and educational view."""
    categories_list = []
    for cat_id, data in CATEGORY_KNOWLEDGE_BASE.items():
        categories_list.append(WasteCategoryDetail(
            id=cat_id.lower().replace(" ", "-"),
            name=data["name"],
            description=data["description"],
            common_items=data["common_items"],
            recyclability=data["recyclability"],
            bin_color=data["bin_color"],
            recycling_code=data["recycling_code"],
            general_tip=data["general_tip"]
        ))
    return categories_list
