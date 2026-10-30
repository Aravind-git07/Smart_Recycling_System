from typing import List, Dict, Any
from fastapi import APIRouter
from ..schemas.classification import WasteCategoryDetail
from ..services.recommendation_engine import get_all_categories

router = APIRouter(prefix="/api", tags=["Categories & Guidelines"])

@router.get("/categories", response_model=List[WasteCategoryDetail])
def list_categories():
    """
    List all supported waste categories, descriptions, common items, and bin color standards.
    """
    return get_all_categories()

@router.get("/guidelines")
def get_environmental_guidelines() -> Dict[str, Any]:
    """
    Return comprehensive environmental awareness principles, 3-way segregation guidelines,
    material life-cycle data, and common contamination mistakes for project defense and educational use.
    """
    return {
        "title": "Waste Management & Circular Economy Principles",
        "hierarchy": [
            {
                "tier": "Refuse & Reduce",
                "importance": "Highest Priority",
                "description": "Minimize consumption of single-use packaging and unrecyclable composite plastics at the source."
            },
            {
                "tier": "Reuse & Repair",
                "importance": "Second Priority",
                "description": "Extend product lifespans by repurposing containers, jars, and cartons, or repairing electronics before discarding."
            },
            {
                "tier": "Recycle & Compost",
                "importance": "Third Priority",
                "description": "Segregate materials at source into clean, dry streams (paper, plastic, metal, glass) and separate wet compostables."
            },
            {
                "tier": "Responsible Disposal",
                "importance": "Final Measure",
                "description": "Direct unrecyclable composites to sanitary engineered landfills or waste-to-energy plants. Keep hazardous e-waste out."
            }
        ],
        "segregation_rules": [
            {
                "stream": "Dry Recyclables (Blue / Yellow Bin)",
                "materials": "Clean paper, flattened cardboard, rigid plastic bottles (#1 PET, #2 HDPE), metal cans, foil balls.",
                "golden_rule": "Must be clean and dry. A single greasy takeaway container can ruin an entire bale of paper pulp."
            },
            {
                "stream": "Wet / Organic Waste (Green Bin)",
                "materials": "Vegetable peels, fruit rinds, leftover food, coffee grounds, garden clippings.",
                "golden_rule": "Never mix plastic wrapping or polythene bags with wet waste. Wet waste should go to compost or biomethanation."
            },
            {
                "stream": "Domestic Hazardous & E-Waste (Red / Specialist Drop-off)",
                "materials": "Batteries, chargers, broken electronics, fluorescent tube lights, aerosol paint, pesticide containers.",
                "golden_rule": "NEVER throw batteries into standard trash. Lithium batteries cause fires in garbage compaction trucks."
            }
        ],
        "common_contamination_mistakes": [
            {
                "mistake": "Throwing greasy pizza boxes into the paper recycling bin",
                "reason": "Paper recycling utilizes water pulping. Oil and grease do not dissolve in water and prevent cellulose fibers from binding."
            },
            {
                "mistake": "Placing plastic grocery bags in standard curbside single-stream bins",
                "reason": "Thin plastic film wraps around rotating sorting axles and jams conveyor machinery at Material Recovery Facilities (MRFs)."
            },
            {
                "mistake": "Mixing drinking glasses or ceramic mugs with container glass bottles",
                "reason": "Ceramics and Pyrex have significantly higher melting temperatures than container soda-lime glass, leaving un-melted stones in new bottles."
            },
            {
                "mistake": "Leaving liquid inside plastic bottles",
                "reason": "Liquids add unnecessary transport weight and spill onto dry paper streams, causing mold contamination."
            }
        ]
    }
