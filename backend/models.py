import datetime
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, JSON
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(String(50), default="Safety Officer")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(50), primary_key=True, index=True)
    description = Column(Text, nullable=False)
    location = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    risk_score = Column(Integer, nullable=False)
    severity = Column(String(20), nullable=False)
    
    # Store lists/dicts as JSON
    hazards = Column(JSON, nullable=False)
    risk_factors = Column(JSON, nullable=False)
    explanation = Column(Text, nullable=False)
    immediate_actions = Column(JSON, nullable=False)
    preventive_actions = Column(JSON, nullable=False)
    confidence = Column(Integer, default=85)
    
    people_affected = Column(Integer, default=0)
    injury_reported = Column(Boolean, default=False)
    status = Column(String(50), default="Pending")

    # Hybrid AI Extensions
    data_source = Column(String(20), default="REAL")
    ml_prediction = Column(JSON, nullable=True)
    ml_confidence = Column(Float, nullable=True)
    model_version = Column(String(20), default="1.0.0")
    rule_based_score = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
