import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Incident
from backend.routes.incidents import format_incident
from backend.services.pdf_generator import generate_incident_pdf

router = APIRouter(prefix="/api", tags=["Reports"])

@router.get("/reports/{incident_id}")
def download_incident_report(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    inc_dict = format_incident(inc)
    pdf_bytes = generate_incident_pdf(inc_dict)

    filename = f"SafeSense_Report_{incident_id}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
