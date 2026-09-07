import datetime
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.models import User, Incident
from backend.services.risk_engine import analyze_incident_text

INITIAL_INCIDENTS = [
    {
        "id": "INC-2026-001",
        "description": "A container is leaking chemical solvent near the chemical storage area. A worker slipped on the chemical puddle and suffered a minor leg injury and chemical skin irritation.",
        "location": "Chemical Storage Bay 4",
        "department": "Laboratory",
        "people_affected": 2,
        "injury_reported": True,
        "status": "Under Investigation",
        "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2)
    },
    {
        "id": "INC-2026-002",
        "description": "Worker slipped near wet floor outside the washroom area but no physical injury was reported.",
        "location": "Main Hallway - 2nd Floor",
        "department": "Warehouse",
        "people_affected": 1,
        "injury_reported": False,
        "status": "Resolved",
        "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=5)
    },
    {
        "id": "INC-2026-003",
        "description": "An exposed electrical cable produced continuous sparks near the primary production machine. Circuit breaker tripped.",
        "location": "Production Line 3",
        "department": "Manufacturing",
        "people_affected": 3,
        "injury_reported": False,
        "status": "Pending",
        "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
    },
    {
        "id": "INC-2026-004",
        "description": "Machine safety guard interlock failed on rotating conveyor belt during shift change. Worker narrowly avoided hand pinch injury.",
        "location": "Assembly Plant Section B",
        "department": "Manufacturing",
        "people_affected": 1,
        "injury_reported": False,
        "status": "Under Investigation",
        "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=8)
    },
    {
        "id": "INC-2026-005",
        "description": "A small fire was detected near electrical distribution panel #2 due to short circuit overheating. Smoke filled the corridor.",
        "location": "Electrical Substation 2",
        "department": "Construction",
        "people_affected": 4,
        "injury_reported": False,
        "status": "Under Investigation",
        "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=14)
    },
    {
        "id": "INC-2026-006",
        "description": "Worker observed operating overhead crane without helmet and no gloves in high-impact timber zone.",
        "location": "Loading Dock 1",
        "department": "Warehouse",
        "people_affected": 1,
        "injury_reported": False,
        "status": "Resolved",
        "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=12)
    },
    {
        "id": "INC-2026-007",
        "description": "Forklift collision with storage rack in aisle 6 causing pallet collapse and minor arm wound for driver.",
        "location": "Central Distribution Center",
        "department": "Warehouse",
        "people_affected": 2,
        "injury_reported": True,
        "status": "Pending",
        "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=3)
    },
    {
        "id": "INC-2026-008",
        "description": "Toxic gas leakage fumes detected near underground ventilation shaft. High-temperature alarm activated.",
        "location": "Underground Tunnel Shaft B",
        "department": "Mining",
        "people_affected": 6,
        "injury_reported": True,
        "status": "Pending",
        "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=4)
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Idempotent Admin User creation
        admin = db.query(User).filter(User.email == "admin@safesense.com").first()
        if not admin:
            admin_user = User(
                name="Safety Administrator",
                email="admin@safesense.com",
                password="admin123",
                role="Senior Safety Manager"
            )
            db.add(admin_user)
            db.commit()
            print("[INFO] Default admin user created.")
        else:
            print("[INFO] Admin user already exists. Skipping user creation.")

        # Idempotent Incident seeding - ONLY if table is completely empty
        existing_count = db.query(Incident).count()
        if existing_count == 0:
            print("[INFO] Database is empty. Seeding initial 8 realistic incident records...")
            for data in INITIAL_INCIDENTS:
                analysis = analyze_incident_text(
                    description=data["description"],
                    location=data["location"],
                    department=data["department"],
                    people_affected=data["people_affected"],
                    injury_reported=data["injury_reported"]
                )

                incident = Incident(
                    id=data["id"],
                    description=data["description"],
                    location=data["location"],
                    department=data["department"],
                    category=analysis["category"],
                    risk_score=analysis["risk_score"],
                    severity=analysis["severity"],
                    hazards=analysis["hazards"],
                    risk_factors=analysis["risk_factors"],
                    explanation=analysis["explanation"],
                    immediate_actions=analysis["immediate_actions"],
                    preventive_actions=analysis["preventive_actions"],
                    confidence=analysis["confidence"],
                    people_affected=data["people_affected"],
                    injury_reported=data["injury_reported"],
                    status=data["status"],
                    created_at=data["created_at"]
                )
                db.add(incident)
            db.commit()
            print("[SUCCESS] Database successfully seeded with 8 realistic incidents!")
        else:
            print(f"[INFO] Database already contains {existing_count} incident records. Safe-skipping incident seeding.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
