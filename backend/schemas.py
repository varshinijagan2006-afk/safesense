from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class AnalyzeRequest(BaseModel):
    description: str = Field(..., min_length=5, description="Incident text description")
    location: str = Field(default="Main Site", description="Incident location")
    department: str = Field(default="Manufacturing", description="Department name")
    people_affected: Optional[int] = 0
    injury_reported: Optional[bool] = False
    date_time: Optional[str] = None

class RiskFactor(BaseModel):
    factor: str
    impact: str
    points: int

class AnalyzeResponse(BaseModel):
    risk_score: int
    severity: str
    category: str
    hazards: List[str]
    risk_factors: List[RiskFactor]
    explanation: str
    immediate_actions: List[str]
    preventive_actions: List[str]
    confidence: int

class IncidentCreate(BaseModel):
    description: str
    location: str
    department: str
    category: str
    risk_score: int
    severity: str
    hazards: List[str]
    risk_factors: List[RiskFactor]
    explanation: str
    immediate_actions: List[str]
    preventive_actions: List[str]
    confidence: int = 85
    people_affected: Optional[int] = 0
    injury_reported: Optional[bool] = False
    status: Optional[str] = "Pending"
    created_at: Optional[str] = None

class IncidentStatusUpdate(BaseModel):
    status: str

class IncidentResponse(BaseModel):
    id: str
    description: str
    location: str
    department: str
    category: str
    risk_score: int
    severity: str
    hazards: List[Any]
    risk_factors: List[Any]
    explanation: str
    immediate_actions: List[Any]
    preventive_actions: List[Any]
    confidence: int
    people_affected: int
    injury_reported: bool
    status: str
    created_at: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: dict
    message: Optional[str] = None
