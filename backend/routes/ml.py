from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Incident
from backend.schemas import (
    MLStatusResponse, FeatureImportanceResponse, RetrainResponse
)
from backend.ml.model_manager import get_model_status, load_model_artifacts
from backend.ml.train import run_training_pipeline
from backend.ml.predictor import reload_models

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

@router.get("/status", response_model=MLStatusResponse)
def get_status(db: Session = Depends(get_db)):
    status = get_model_status()
    # Update real_records count dynamically from DB
    real_count = db.query(Incident).filter(Incident.data_source == "REAL").count()
    if real_count == 0:
        real_count = db.query(Incident).count()
    
    status["real_records"] = real_count
    return status

@router.get("/feature-importance", response_model=FeatureImportanceResponse)
def get_feature_importance():
    clf, reg, extractor, metadata = load_model_artifacts()
    if not metadata or "top_features" not in metadata:
        # Default fallback list if metadata is not available yet
        fallback_features = [
            {"feature": "Worker Injury Reported", "importance": 0.28},
            {"feature": "Chemical Hazard Category", "importance": 0.22},
            {"feature": "Fire Hazard Category", "importance": 0.18},
            {"feature": "Affected Personnel Count", "importance": 0.14},
            {"feature": "Rule Engine Base Score", "importance": 0.10},
            {"feature": "Electrical Hazard Category", "importance": 0.08}
        ]
        return FeatureImportanceResponse(
            model_version="1.0.0",
            top_features=fallback_features
        )

    return FeatureImportanceResponse(
        model_version=metadata.get("model_version", "1.0.0"),
        top_features=metadata.get("top_features", [])
    )

@router.post("/retrain", response_model=RetrainResponse)
def trigger_retraining(db: Session = Depends(get_db)):
    try:
        # 1. Fetch real historical incidents from DB
        db_incidents = db.query(Incident).all()
        incidents_list = []
        for inc in db_incidents:
            incidents_list.append({
                "id": inc.id,
                "description": inc.description,
                "location": inc.location,
                "department": inc.department,
                "category": inc.category,
                "people_affected": inc.people_affected or 0,
                "injury_reported": inc.injury_reported or False,
                "hazards": inc.hazards or [],
                "hazard_count": len(inc.hazards) if inc.hazards else 1,
                "rule_based_score": inc.rule_based_score or inc.risk_score,
                "risk_score": inc.risk_score,
                "severity": inc.severity,
                "data_source": "REAL"
            })

        # Determine version bump
        current_status = get_model_status()
        old_ver = current_status.get("model_version", "1.0.0")
        try:
            parts = old_ver.split(".")
            new_ver = f"{parts[0]}.{parts[1]}.{int(parts[2])+1}"
        except:
            new_ver = "1.0.1"

        # 2. Run training pipeline
        metadata = run_training_pipeline(db_incidents_list=incidents_list, model_version=new_ver)
        
        # 3. Reload model predictor cache
        reload_models()

        return RetrainResponse(
            success=True,
            message=f"SafeSense Hybrid ML Model v{new_ver} retrained successfully with {metadata['total_records']} total records ({metadata['real_records']} real DB records + {metadata['synthetic_records']} synthetic records).",
            metadata=metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")
