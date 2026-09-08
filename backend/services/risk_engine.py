import re
from typing import Dict, List, Any
from backend.ml.predictor import compute_hybrid_risk_assessment

KEYWORDS = {
    "CHEMICAL": {
        "words": ["chemical", "toxic", "acid", "gas", "leak", "leakage", "spill", "solvent", "fumes", "hazmat", "corrosive"],
        "name": "Chemical Hazard",
        "points": 25,
        "hazard_label": "Chemical leakage / spill"
    },
    "FIRE": {
        "words": ["fire", "smoke", "flame", "explosion", "burning", "spark", "combustion", "ignate", "ignited"],
        "name": "Fire & Explosion Hazard",
        "points": 30,
        "hazard_label": "Fire / explosion threat"
    },
    "ELECTRICAL": {
        "words": ["electric", "shock", "wire", "exposed cable", "short circuit", "voltage", "sparking", "panel", "arc"],
        "name": "Electrical Hazard",
        "points": 25,
        "hazard_label": "Exposed electrical component / shock risk"
    },
    "FALL": {
        "words": ["slip", "fall", "fell", "ladder", "height", "staircase", "slippery", "tripped", "trip", "wet floor"],
        "name": "Slip, Trip & Fall Hazard",
        "points": 20,
        "hazard_label": "Slip or fall hazard"
    },
    "MACHINERY": {
        "words": ["machine", "conveyor", "equipment", "rotating", "mechanical", "press", "forklift", "guard", "blade"],
        "name": "Machinery & Equipment Hazard",
        "points": 20,
        "hazard_label": "Equipment or machinery risk"
    },
    "INJURY": {
        "words": ["injured", "injury", "bleeding", "wound", "hurt", "pain", "laceration", "cut"],
        "name": "Worker Injury Reported",
        "points": 25,
        "hazard_label": "Physical injury sustained"
    },
    "SEVERE_INJURY": {
        "words": ["unconscious", "fracture", "severe injury", "heavy bleeding", "amputation", "head injury", "burns"],
        "name": "Severe Physical Trauma",
        "points": 35,
        "hazard_label": "Critical worker trauma"
    },
    "PPE": {
        "words": ["without helmet", "without gloves", "no gloves", "no helmet", "no safety equipment", "unequipped", "no ppe", "missing ppe"],
        "name": "PPE Non-Compliance",
        "points": 15,
        "hazard_label": "Unsafe worker equipment (PPE violation)"
    },
    "EMERGENCY": {
        "words": ["unconscious", "explosion", "fire", "severe injury", "trapped", "critical", "emergency", "fatal", "collapse"],
        "name": "Emergency Situation",
        "points": 25,
        "hazard_label": "High-urgency emergency condition"
    }
}

RECOMMENDED_ACTIONS = {
    "CHEMICAL": {
        "immediate": [
            "Isolate the spill/leak area immediately and restrict access.",
            "Prevent unauthorized personnel from entering the hazard zone.",
            "Ensure adequate ventilation and deploy chemical-resistant PPE.",
            "Notify the designated HAZMAT response team and Safety Officer."
        ],
        "preventive": [
            "Inspect chemical storage containers and secondary containment bunds.",
            "Review safe chemical handling Standard Operating Procedures (SOPs).",
            "Ensure Safety Data Sheets (SDS) and emergency spill kits are accessible."
        ]
    },
    "FIRE": {
        "immediate": [
            "Evacuate all personnel from the affected zone immediately.",
            "Sound the workplace fire alarm and initiate emergency protocols.",
            "Contact local emergency fire response services immediately.",
            "Isolate power sources near the fire area if safe to do so."
        ],
        "preventive": [
            "Inspect fire suppression systems, extinguishers, and alarm sensors.",
            "Audit flammable liquid storage and electrical junction boxes.",
            "Conduct mandatory workplace fire evacuation drills."
        ]
    },
    "ELECTRICAL": {
        "immediate": [
            "Safely disconnect main power source to the affected equipment or panel.",
            "Implement Lockout/Tagout (LOTO) procedures on the power switch.",
            "Restrict access with high-voltage hazard warning barriers.",
            "Have a qualified certified electrician inspect the exposed wiring."
        ],
        "preventive": [
            "Perform scheduled infrared thermography scans on electrical distribution boards.",
            "Replace damaged, frayed, or ungrounded electrical cables immediately.",
            "Verify all machinery circuits are properly grounded and insulated."
        ]
    },
    "FALL": {
        "immediate": [
            "Secure the wet or hazardous walking surface area immediately.",
            "Deploy 'Caution: Wet Floor / Slip Hazard' signs around the area.",
            "Provide immediate medical assistance if a worker suffered a fall.",
            "Clean up liquid spills or debris thoroughly."
        ],
        "preventive": [
            "Install high-traction anti-slip matting and stair treads in high-risk paths.",
            "Enforce strict housekeeping and daily floor maintenance protocols.",
            "Audit elevated work platforms and guardrail integrity."
        ]
    },
    "MACHINERY": {
        "immediate": [
            "Engage emergency stop button and halt machine operation immediately.",
            "Inspect safety interlocks, light curtains, and mechanical guards.",
            "Provide medical evaluation for affected operators if needed."
        ],
        "preventive": [
            "Schedule comprehensive mechanical maintenance and safety guard audits.",
            "Mandate refresher operator safety training on machinery controls.",
            "Enforce strict Lockout/Tagout (LOTO) rules during maintenance."
        ]
    }
}

DEFAULT_IMMEDIATE = [
    "Isolate the affected area and restrict unauthorized entry.",
    "Notify the facility Safety Officer and site supervisor immediately.",
    "Provide first aid or medical evaluation if personnel are affected.",
    "Document initial observations and take site photographs for investigation."
]

DEFAULT_PREVENTIVE = [
    "Conduct a root-cause investigation with department safety representatives.",
    "Review PPE compliance and equipment safety guidelines.",
    "Hold a mandatory safety toolbox talk with all site workers.",
    "Monitor the affected location after corrective measures are implemented."
]

def analyze_incident_text(
    description: str,
    location: str = "Main Site",
    department: str = "Manufacturing",
    people_affected: int = 0,
    injury_reported: bool = False
) -> Dict[str, Any]:
    text_lower = description.lower()
    
    detected_keys = []
    hazards = []
    risk_factors = []
    total_score = 0
    matched_categories = []

    # 1. Rule-Based Keyword analysis
    for key, data in KEYWORDS.items():
        found = False
        for kw in data["words"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower) or kw in text_lower:
                found = True
                break
        
        if found:
            detected_keys.append(key)
            hazards.append(data["hazard_label"])
            pts = data["points"]
            total_score += pts
            
            impact = "High" if pts >= 25 else "Medium"
            risk_factors.append({
                "factor": data["name"],
                "impact": impact,
                "points": pts
            })

            cat_map = {
                "CHEMICAL": "Chemical",
                "FIRE": "Fire",
                "ELECTRICAL": "Electrical",
                "FALL": "Slip/Fall",
                "MACHINERY": "Equipment/Machinery"
            }
            if key in cat_map and cat_map[key] not in matched_categories:
                matched_categories.append(cat_map[key])

    # 2. Contextual modifiers
    if people_affected and people_affected > 0:
        people_pts = min(20, people_affected * 5)
        total_score += people_pts
        risk_factors.append({
            "factor": f"Affected Personnel ({people_affected} people)",
            "impact": "High" if people_affected > 2 else "Medium",
            "points": people_pts
        })
        hazards.append(f"Multiple personnel exposed ({people_affected} affected)")

    if injury_reported and "INJURY" not in detected_keys and "SEVERE_INJURY" not in detected_keys:
        total_score += 20
        risk_factors.append({
            "factor": "Worker Injury Explicitly Reported",
            "impact": "High",
            "points": 20
        })
        hazards.append("Worker injury reported")

    if len(matched_categories) >= 2:
        total_score += 10
        risk_factors.append({
            "factor": "Compound Multi-Hazard Interaction",
            "impact": "High",
            "points": 10
        })

    loc_lower = location.lower()
    high_risk_locs = ["storage", "chemical", "laboratory", "lab", "boiler", "substation", "high voltage", "warehouse"]
    if any(hl in loc_lower for hl in high_risk_locs):
        total_score += 5
        risk_factors.append({
            "factor": "High-Risk Zone Location",
            "impact": "Medium",
            "points": 5
        })

    # Rule-based score clamping
    rule_score = min(100, max(0, total_score))
    if rule_score == 0:
        rule_score = 15
        risk_factors.append({
            "factor": "General Hazard Baseline",
            "impact": "Low",
            "points": 15
        })
        hazards.append("Unspecified workplace concern")

    # Severity classification
    if rule_score >= 75:
        severity = "CRITICAL"
    elif rule_score >= 55:
        severity = "HIGH"
    elif rule_score >= 30:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    if matched_categories:
        category = " + ".join(matched_categories)
    else:
        category = "Other Safety Hazard"

    explanation_parts = []
    if "CRITICAL" in severity or "HIGH" in severity:
        explanation_parts.append(f"Safety rule policy categorized this incident as {severity} risk ({rule_score}/100 base score).")
    else:
        explanation_parts.append(f"Safety rule policy assigned a {severity} baseline risk score of {rule_score}/100.")

    if matched_categories:
        explanation_parts.append(f"Primary hazard vectors: {', '.join(matched_categories)}.")
    
    if injury_reported or "INJURY" in detected_keys or "SEVERE_INJURY" in detected_keys:
        explanation_parts.append("Worker injury presence elevates risk priority.")

    rule_explanation = " ".join(explanation_parts)

    immediate_actions = []
    preventive_actions = []
    
    for cat_key in ["CHEMICAL", "FIRE", "ELECTRICAL", "FALL", "MACHINERY"]:
        if cat_key in detected_keys or (cat_key == "FALL" and "Slip/Fall" in category) or (cat_key == "CHEMICAL" and "Chemical" in category):
            act = RECOMMENDED_ACTIONS[cat_key]
            for im in act["immediate"]:
                if im not in immediate_actions:
                    immediate_actions.append(im)
            for pr in act["preventive"]:
                if pr not in preventive_actions:
                    preventive_actions.append(pr)

    if not immediate_actions:
        immediate_actions = DEFAULT_IMMEDIATE.copy()
    if not preventive_actions:
        preventive_actions = DEFAULT_PREVENTIVE.copy()

    signal_count = len(detected_keys) + (1 if people_affected > 0 else 0) + (1 if injury_reported else 0)
    confidence = min(98, max(70, 72 + (signal_count * 5) + (8 if len(description) > 50 else 0)))

    rule_result = {
        "risk_score": rule_score,
        "severity": severity,
        "category": category,
        "hazards": hazards,
        "risk_factors": risk_factors,
        "explanation": rule_explanation,
        "immediate_actions": immediate_actions[:5],
        "preventive_actions": preventive_actions[:5],
        "confidence": confidence,
        "rule_based_score": rule_score,
        "ml_predicted_score": rule_score,
        "ml_severity": severity,
        "ml_confidence": float(confidence) / 100.0,
        "prediction_source": "rule_based"
    }

    # 3. Combine with ML prediction via Hybrid Risk Predictor
    hybrid_result = compute_hybrid_risk_assessment(
        rule_result=rule_result,
        description=description,
        location=location,
        department=department,
        people_affected=people_affected,
        injury_reported=injury_reported
    )

    return hybrid_result
