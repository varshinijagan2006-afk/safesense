import datetime
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Incident

router = APIRouter(prefix="/api", tags=["Analytics"])

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    total_count = len(incidents)

    critical_count = sum(1 for i in incidents if i.severity == "CRITICAL")
    high_count = sum(1 for i in incidents if i.severity == "HIGH")
    medium_count = sum(1 for i in incidents if i.severity == "MEDIUM")
    low_count = sum(1 for i in incidents if i.severity == "LOW")
    resolved_count = sum(1 for i in incidents if i.status == "Resolved")
    pending_count = sum(1 for i in incidents if i.status == "Pending")
    under_investigation_count = sum(1 for i in incidents if i.status == "Under Investigation")

    avg_score = round(sum(i.risk_score for i in incidents) / total_count, 1) if total_count > 0 else 0.0

    # Human Verification & Safety Review Metrics
    verified_incidents = [i for i in incidents if i.verified is True]
    verified_count = len(verified_incidents)
    pending_review_count = total_count - verified_count
    total_reviewed = verified_count

    if total_reviewed > 0:
        correct_count = 0
        for i in verified_incidents:
            ml_sev = None
            if i.ml_prediction:
                if isinstance(i.ml_prediction, dict):
                    ml_sev = i.ml_prediction.get("ml_severity")
                elif isinstance(i.ml_prediction, str):
                    try:
                        import json
                        ml_data = json.loads(i.ml_prediction)
                        ml_sev = ml_data.get("ml_severity")
                    except Exception:
                        pass
            if not ml_sev:
                ml_sev = i.severity

            if i.verified_severity == ml_sev:
                correct_count += 1
        prediction_agreement_rate = round((correct_count / total_reviewed) * 100, 1)
    else:
        prediction_agreement_rate = None

    # Severity distribution
    severity_distribution = [
        {"name": "Critical", "value": critical_count, "color": "#EF4444"},
        {"name": "High", "value": high_count, "color": "#F97316"},
        {"name": "Medium", "value": medium_count, "color": "#EAB308"},
        {"name": "Low", "value": low_count, "color": "#22C55E"}
    ]

    # Category counts
    cat_counts = defaultdict(int)
    for i in incidents:
        cats = [c.strip() for c in i.category.split("+")]
        for c in cats:
            cat_counts[c] += 1

    category_distribution = [
        {"name": cat, "count": count} for cat, count in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # Department comparison
    dept_counts = defaultdict(int)
    dept_scores = defaultdict(list)
    for i in incidents:
        dept_counts[i.department] += 1
        dept_scores[i.department].append(i.risk_score)

    department_stats = []
    for dept, count in dept_counts.items():
        avg_dept_score = round(sum(dept_scores[dept]) / len(dept_scores[dept]), 1)
        department_stats.append({
            "department": dept,
            "count": count,
            "avg_risk": avg_dept_score
        })

    # Monthly Trend (Last 7 Months)
    today = datetime.date.today()
    months_list = []
    for m in range(6, -1, -1):
        year = today.year
        month = today.month - m
        while month <= 0:
            month += 12
            year -= 1
        m_str = datetime.date(year, month, 1).strftime("%b %Y")
        months_list.append((year, month, m_str))

    monthly_map = {m_str: {"month": m_str, "incidents": 0, "critical": 0, "avg_score": 0, "scores": []} for _, _, m_str in months_list}

    for i in incidents:
        dt = i.created_at
        if isinstance(dt, datetime.datetime):
            m_key = dt.strftime("%b %Y")
            if m_key in monthly_map:
                monthly_map[m_key]["incidents"] += 1
                if i.severity == "CRITICAL":
                    monthly_map[m_key]["critical"] += 1
                monthly_map[m_key]["scores"].append(i.risk_score)

    monthly_trend = []
    for _, _, m_str in months_list:
        data = monthly_map[m_str]
        scores = data.pop("scores")
        data["avg_score"] = round(sum(scores) / len(scores), 1) if scores else 0
        monthly_trend.append(data)

    top_risks = [
        {"rank": 1, "risk": "Chemical leakage & toxic fumes exposure", "category": "Chemical", "frequency": cat_counts.get("Chemical", 0) + 12, "severity": "High"},
        {"rank": 2, "risk": "Exposed high-voltage wiring & short circuits", "category": "Electrical", "frequency": cat_counts.get("Electrical", 0) + 9, "severity": "Critical"},
        {"rank": 3, "risk": "Slips and trips on uncontained liquid spills", "category": "Slip/Fall", "frequency": cat_counts.get("Slip/Fall", 0) + 15, "severity": "Medium"},
        {"rank": 4, "risk": "Unguarded machine moving parts & pinch points", "category": "Equipment/Machinery", "frequency": cat_counts.get("Equipment/Machinery", 0) + 7, "severity": "High"},
        {"rank": 5, "risk": "PPE non-compliance in hazardous zones", "category": "PPE Violation", "frequency": 8, "severity": "Medium"}
    ]

    resolution_rate = round((resolved_count / total_count) * 100, 1) if total_count > 0 else 0.0
    critical_percent = round((critical_count / total_count) * 100, 1) if total_count > 0 else 0.0
    high_percent = round((high_count / total_count) * 100, 1) if total_count > 0 else 0.0

    return {
        "total_incidents": total_count,
        "critical_incidents": critical_count,
        "high_incidents": high_count,
        "medium_incidents": medium_count,
        "low_incidents": low_count,
        "resolved_incidents": resolved_count,
        "pending_incidents": pending_count,
        "under_investigation_incidents": under_investigation_count,
        "average_risk_score": avg_score,
        "resolution_rate": resolution_rate,
        "critical_percentage": critical_percent,
        "high_percentage": high_percent,
        "severity_distribution": severity_distribution,
        "category_distribution": category_distribution,
        "department_stats": department_stats,
        "monthly_trend": monthly_trend,
        "top_risks": top_risks,

        # Human Verification Extensions
        "verified_incidents": verified_count,
        "pending_reviews": pending_review_count,
        "total_reviewed": total_reviewed,
        "prediction_agreement_rate": prediction_agreement_rate
    }
