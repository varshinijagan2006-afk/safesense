import datetime
import uuid
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database import get_db
from backend.models import Incident
from backend.schemas import (
    AnalyzeRequest, AnalyzeResponse,
    IncidentCreate, IncidentStatusUpdate, IncidentResponse
)
from backend.services.risk_engine import analyze_incident_text

router = APIRouter(prefix="/api", tags=["Incidents"])

def format_incident(inc: Incident) -> dict:
    hazards = inc.hazards
    if isinstance(hazards, str):
        try: hazards = json.loads(hazards)
        except: hazards = [hazards]

    risk_factors = inc.risk_factors
    if isinstance(risk_factors, str):
        try: risk_factors = json.loads(risk_factors)
        except: risk_factors = []

    imm_actions = inc.immediate_actions
    if isinstance(imm_actions, str):
        try: imm_actions = json.loads(imm_actions)
        except: imm_actions = [imm_actions]

    prev_actions = inc.preventive_actions
    if isinstance(prev_actions, str):
        try: prev_actions = json.loads(prev_actions)
        except: prev_actions = [prev_actions]

    ml_pred = inc.ml_prediction
    if isinstance(ml_pred, str):
        try: ml_pred = json.loads(ml_pred)
        except: ml_pred = None

    created_at_str = inc.created_at.strftime("%Y-%m-%d %H:%M:%S") if isinstance(inc.created_at, datetime.datetime) else str(inc.created_at)

    return {
        "id": inc.id,
        "description": inc.description,
        "location": inc.location,
        "department": inc.department,
        "category": inc.category,
        "risk_score": inc.risk_score,
        "severity": inc.severity,
        "hazards": hazards or [],
        "risk_factors": risk_factors or [],
        "explanation": inc.explanation,
        "immediate_actions": imm_actions or [],
        "preventive_actions": prev_actions or [],
        "confidence": inc.confidence or 85,
        "people_affected": inc.people_affected or 0,
        "injury_reported": bool(inc.injury_reported),
        "status": inc.status or "Pending",
        "created_at": created_at_str,

        # Hybrid AI Extensions
        "data_source": inc.data_source or "REAL",
        "ml_prediction": ml_pred,
        "ml_confidence": inc.ml_confidence,
        "model_version": inc.model_version or "1.0.0",
        "rule_based_score": inc.rule_based_score or inc.risk_score
    }

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    res = analyze_incident_text(
        description=req.description,
        location=req.location,
        department=req.department,
        people_affected=req.people_affected or 0,
        injury_reported=req.injury_reported or False
    )
    return res

@router.post("/incidents", response_model=IncidentResponse)
def create_incident(req: IncidentCreate, db: Session = Depends(get_db)):
    inc_count = db.query(Incident).count() + 1
    inc_id = f"INC-2026-{inc_count:03d}"
    
    if db.query(Incident).filter(Incident.id == inc_id).first():
        inc_id = f"INC-2026-{uuid.uuid4().hex[:4].upper()}"

    incident = Incident(
        id=inc_id,
        description=req.description,
        location=req.location,
        department=req.department,
        category=req.category,
        risk_score=req.risk_score,
        severity=req.severity,
        hazards=req.hazards,
        risk_factors=[rf.model_dump() if hasattr(rf, "model_dump") else rf for rf in req.risk_factors],
        explanation=req.explanation,
        immediate_actions=req.immediate_actions,
        preventive_actions=req.preventive_actions,
        confidence=req.confidence or 85,
        people_affected=req.people_affected or 0,
        injury_reported=req.injury_reported or False,
        status=req.status or "Pending",
        created_at=datetime.datetime.utcnow(),

        # Hybrid AI Extensions
        data_source=req.data_source or "REAL",
        ml_prediction=req.ml_prediction,
        ml_confidence=req.ml_confidence,
        model_version=req.model_version or "1.0.0",
        rule_based_score=req.rule_based_score or req.risk_score
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return format_incident(incident)

@router.get("/incidents", response_model=List[IncidentResponse])
def get_incidents(
    search: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: Optional[int] = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)

    if severity and severity != "ALL":
        query = query.filter(Incident.severity == severity)
    if status and status != "ALL":
        query = query.filter(Incident.status == status)
    if category and category != "ALL":
        query = query.filter(Incident.category.contains(category))
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            (Incident.id.ilike(s)) |
            (Incident.description.ilike(s)) |
            (Incident.location.ilike(s)) |
            (Incident.department.ilike(s)) |
            (Incident.category.ilike(s))
        )

    incidents = query.order_by(desc(Incident.created_at)).limit(limit).all()
    return [format_incident(inc) for inc in incidents]

@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return format_incident(inc)

@router.put("/incidents/{incident_id}", response_model=IncidentResponse)
def update_incident_status(incident_id: str, update_req: IncidentStatusUpdate, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    inc.status = update_req.status
    db.commit()
    db.refresh(inc)
    return format_incident(inc)

@router.delete("/incidents/{incident_id}")
def delete_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db.delete(inc)
    db.commit()
    return {"message": "Incident deleted successfully", "id": incident_id}
