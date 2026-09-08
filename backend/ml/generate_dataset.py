import random
import pandas as pd
from typing import List, Dict, Any

CATEGORIES = [
    "Chemical", "Electrical", "Fire", "Slip/Fall", 
    "Equipment/Machinery", "PPE Violation", "Gas Leak", "Forklift", "Other"
]

DEPARTMENTS = ["Mining", "Manufacturing", "Construction", "Laboratory", "Warehouse", "Other"]

LOCATIONS = [
    "Chemical Storage Bay 1", "Chemical Storage Bay 4", "Main Production Line 3",
    "Assembly Plant B", "Electrical Substation 2", "Loading Dock 1",
    "Central Warehouse Aisle 6", "Underground Shaft B", "Main Corridor 2nd Floor",
    "Boiler Room", "Testing Laboratory B", "Maintenance Workshop"
]

TEMPLATE_PATTERNS = {
    "Chemical": [
        ("Container leaking toxic acid solvent in {loc}. Worker touched fluid experiencing skin irritation.", 25, 65, True),
        ("Chemical spill detected near storage drums. Strong fumes causing dizziness for staff.", 20, 55, False),
        ("Corrosive liquid splash during transfer in {dept} department. Worker suffered eye chemical burn.", 35, 80, True),
        ("Uncontained solvent leakage from drum valve. Toxic vapors filling closed room.", 25, 60, False),
        ("Heavy chemical leak from pipeline in {loc}. Multiple workers exposed with skin burns.", 40, 88, True)
    ],
    "Electrical": [
        ("Exposed high voltage wiring produced sparks near {dept} machinery.", 25, 60, False),
        ("Short circuit in distribution panel #2 causing loud arc flash and circuit trip.", 30, 75, False),
        ("Operator suffered electrical shock from ungrounded cable near production station.", 35, 82, True),
        ("Frayed electrical cord sparking near flammable materials storage.", 25, 65, False),
        ("Severe electrical arc explosion in high voltage substation causing burns to electrician.", 45, 92, True)
    ],
    "Fire": [
        ("Small flame outbreak detected near overheating motor in {loc}.", 30, 70, False),
        ("Smoke and fire outbreak near chemical waste bin. Emergency alarm activated.", 35, 78, False),
        ("Electrical panel caught fire sending thick toxic smoke through corridor.", 40, 85, False),
        ("Explosion and fire in boiler room causing structural damage and severe burns.", 50, 96, True),
        ("Friction heat ignited oil spill on manufacturing floor.", 25, 60, False)
    ],
    "Slip/Fall": [
        ("Worker slipped on wet slippery floor near washroom. No physical injury sustained.", 10, 25, False),
        ("Employee tripped over loose cable in aisle and twisted ankle.", 20, 45, True),
        ("Technician fell from 6ft ladder while inspecting overhead piping suffering wrist fracture.", 35, 75, True),
        ("Slip on oily surface near conveyor line causing minor bruise.", 15, 35, False),
        ("Severe fall down staircase due to missing handrail causing head laceration.", 40, 85, True)
    ],
    "Equipment/Machinery": [
        ("Conveyor belt guard interlock failure exposed rotating pinch point.", 20, 50, False),
        ("Machine operator hand caught in rotating press due to missing safety guard.", 40, 88, True),
        ("Hydraulic press malfunctioned dropping press head unexpectedly.", 30, 70, False),
        ("Laceration from unshielded saw blade during cutting operation.", 30, 68, True),
        ("Overhead crane cable snapped dropping heavy metal component.", 45, 90, False)
    ],
    "PPE Violation": [
        ("Worker observed operating crane without safety helmet and safety glasses.", 15, 30, False),
        ("Employee handling hazardous solvents without chemical gloves or visor.", 20, 42, False),
        ("Contractor entering construction site without steel-toe boots or hard hat.", 15, 28, False),
        ("Unshielded welding operation without protective face shield.", 25, 52, False)
    ],
    "Gas Leak": [
        ("Toxic gas fumes leakage detected in underground ventilation shaft.", 35, 76, False),
        ("Pressurized gas cylinder valve leak producing loud hissing and asphyxiation threat.", 40, 84, False),
        ("Ammonia refrigerant gas leak in cold storage warehouse causing evacuation.", 45, 90, True)
    ],
    "Forklift": [
        ("Forklift collided with storage rack causing pallet collapse in aisle.", 25, 55, False),
        ("Forklift tipped over while carrying overloaded pallet injuring operator arm.", 35, 78, True),
        ("Pedestrian struck by reversing forklift near loading dock.", 40, 84, True)
    ],
    "Other": [
        ("Heat exhaustion reported by worker operating in unventilated area.", 20, 40, False),
        ("Noise level exceeding threshold near compressor without hearing protection.", 15, 32, False),
        ("Worker suffered back strain while manually lifting heavy wooden crate.", 20, 45, True)
    ]
}

def generate_synthetic_incidents(num_samples: int = 1000, random_seed: int = 42) -> pd.DataFrame:
    random.seed(random_seed)
    records = []

    for i in range(num_samples):
        cat = random.choice(CATEGORIES)
        dept = random.choice(DEPARTMENTS)
        loc = random.choice(LOCATIONS)

        patterns = TEMPLATE_PATTERNS.get(cat, TEMPLATE_PATTERNS["Other"])
        tmpl, base_min, base_max, default_injury = random.choice(patterns)

        description = tmpl.format(loc=loc, dept=dept)

        # Determine injury & affected count
        if default_injury:
            injury = random.choice([True, True, True, False])
        else:
            injury = random.choice([False, False, False, True])

        people = random.choices([1, 2, 3, 4, 5, 8], weights=[0.6, 0.2, 0.1, 0.05, 0.03, 0.02])[0]

        # Calculate logical score with slight random variance
        score = random.randint(base_min, base_max)
        if injury:
            score += random.randint(8, 18)
        if people > 2:
            score += (people - 2) * random.randint(3, 6)

        # Location risk boost
        if any(h in loc.lower() for h in ["chemical", "substation", "boiler", "shaft"]):
            score += random.randint(3, 8)

        score = min(100, max(10, score))

        # Severity mapping
        if score >= 75:
            severity = "CRITICAL"
        elif score >= 55:
            severity = "HIGH"
        elif score >= 30:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        # Detect hazard flags
        hazards = []
        if "chemical" in description.lower() or "acid" in description.lower() or "solvent" in description.lower():
            hazards.append("Chemical leakage / spill")
        if "fire" in description.lower() or "flame" in description.lower() or "smoke" in description.lower() or "explosion" in description.lower():
            hazards.append("Fire / explosion threat")
        if "electric" in description.lower() or "spark" in description.lower() or "arc" in description.lower():
            hazards.append("Exposed electrical component / shock risk")
        if "slip" in description.lower() or "fall" in description.lower() or "tripped" in description.lower():
            hazards.append("Slip or fall hazard")
        if "machine" in description.lower() or "press" in description.lower() or "conveyor" in description.lower() or "forklift" in description.lower():
            hazards.append("Equipment or machinery risk")
        if injury:
            hazards.append("Physical injury sustained")

        if not hazards:
            hazards.append("Workplace safety concern")

        records.append({
            "id": f"SYN-{i+1000:04d}",
            "description": description,
            "location": loc,
            "department": dept,
            "category": cat,
            "people_affected": people,
            "injury_reported": injury,
            "hazards": hazards,
            "hazard_count": len(hazards),
            "rule_based_score": score,
            "risk_score": score,
            "severity": severity,
            "data_source": "SYNTHETIC"
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    df = generate_synthetic_incidents(1000)
    print(f"Generated {len(df)} synthetic incidents.")
    print("Severity Breakdown:")
    print(df["severity"].value_counts())
    print("\nCategory Breakdown:")
    print(df["category"].value_counts())
