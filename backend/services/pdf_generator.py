import io
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_incident_pdf(incident_dict: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor('#F59E0B'),
        spaceAfter=15
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#334155'),
        leading=14
    )
    bold_body_style = ParagraphStyle(
        'BoldBodyText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor('#1E293B'),
        leading=14
    )

    elements = []

    # Title Banner
    elements.append(Paragraph("SAFESENSE", subtitle_style))
    elements.append(Paragraph("Workplace Incident Risk & Safety Report", title_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#F59E0B'), spaceBefore=4, spaceAfter=15))

    # Meta Info Table
    inc_id = incident_dict.get("id", "N/A")
    date_str = incident_dict.get("created_at", "N/A")
    if isinstance(date_str, str) and len(date_str) > 10:
        date_str = date_str[:10]
    
    location = incident_dict.get("location", "N/A")
    department = incident_dict.get("department", "N/A")
    category = incident_dict.get("category", "N/A")
    severity = incident_dict.get("severity", "N/A")
    risk_score = str(incident_dict.get("risk_score", 0))
    status = incident_dict.get("status", "Pending")

    meta_data = [
        [Paragraph("Incident ID:", bold_body_style), Paragraph(inc_id, body_style), Paragraph("Date:", bold_body_style), Paragraph(date_str, body_style)],
        [Paragraph("Location:", bold_body_style), Paragraph(location, body_style), Paragraph("Department:", bold_body_style), Paragraph(department, body_style)],
        [Paragraph("Category:", bold_body_style), Paragraph(category, body_style), Paragraph("Status:", bold_body_style), Paragraph(status, body_style)],
    ]

    meta_table = Table(meta_data, colWidths=[100, 170, 100, 170])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 15))

    # Risk Assessment Box
    sev_color = colors.HexColor('#EF4444') if severity == 'CRITICAL' else (
        colors.HexColor('#F97316') if severity == 'HIGH' else (
            colors.HexColor('#EAB308') if severity == 'MEDIUM' else colors.HexColor('#22C55E')
        )
    )

    risk_data = [
        [
            Paragraph("RISK SCORE", ParagraphStyle('RL', parent=bold_body_style, textColor=colors.white, alignment=1)),
            Paragraph("SEVERITY CLASSIFICATION", ParagraphStyle('RL2', parent=bold_body_style, textColor=colors.white, alignment=1))
        ],
        [
            Paragraph(f"<font size=24><b>{risk_score}</b></font> / 100", ParagraphStyle('RL3', parent=body_style, alignment=1)),
            Paragraph(f"<font size=16 color='{sev_color.hexval()}'><b>{severity}</b></font>", ParagraphStyle('RL4', parent=body_style, alignment=1))
        ]
    ]
    risk_table = Table(risk_data, colWidths=[270, 270])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), colors.HexColor('#0F172A')),
        ('BACKGROUND', (0,1), (1,1), colors.HexColor('#F1F5F9')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
    ]))
    elements.append(risk_table)
    elements.append(Spacer(1, 15))

    # Incident Description
    elements.append(Paragraph("1. Incident Description", heading_style))
    desc_text = incident_dict.get("description", "No description provided.")
    elements.append(Paragraph(desc_text, body_style))
    elements.append(Spacer(1, 12))

    # AI Rationale
    elements.append(Paragraph("2. Explainable AI Assessment Rationale", heading_style))
    explanation = incident_dict.get("explanation", "N/A")
    elements.append(Paragraph(explanation, body_style))
    elements.append(Spacer(1, 12))

    # Detected Hazards & Risk Factors
    elements.append(Paragraph("3. Detected Hazards & Risk Factors", heading_style))
    hazards = incident_dict.get("hazards", [])
    if isinstance(hazards, str):
        try: hazards = json.loads(hazards)
        except: hazards = [hazards]
    
    haz_str = ", ".join(hazards) if hazards else "None detected"
    elements.append(Paragraph(f"<b>Detected Hazards:</b> {haz_str}", body_style))
    elements.append(Spacer(1, 8))

    # Risk Factors Table
    risk_factors = incident_dict.get("risk_factors", [])
    if isinstance(risk_factors, str):
        try: risk_factors = json.loads(risk_factors)
        except: risk_factors = []
    
    if risk_factors:
        rf_rows = [[Paragraph("Risk Factor", bold_body_style), Paragraph("Impact", bold_body_style), Paragraph("Score Impact", bold_body_style)]]
        for rf in risk_factors:
            rf_rows.append([
                Paragraph(str(rf.get("factor", "N/A")), body_style),
                Paragraph(str(rf.get("impact", "N/A")), body_style),
                Paragraph(f"+{rf.get('points', 0)} pts", body_style)
            ])
        rf_table = Table(rf_rows, colWidths=[260, 140, 140])
        rf_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ]))
        elements.append(rf_table)
        elements.append(Spacer(1, 12))

    # Immediate Actions
    elements.append(Paragraph("4. Recommended Immediate Safety Actions", heading_style))
    imm_actions = incident_dict.get("immediate_actions", [])
    if isinstance(imm_actions, str):
        try: imm_actions = json.loads(imm_actions)
        except: imm_actions = [imm_actions]
    
    for idx, act in enumerate(imm_actions, 1):
        elements.append(Paragraph(f"<b>{idx}.</b> {act}", body_style))
    elements.append(Spacer(1, 12))

    # Preventive Actions
    elements.append(Paragraph("5. Recommended Preventive & Corrective Actions", heading_style))
    prev_actions = incident_dict.get("preventive_actions", [])
    if isinstance(prev_actions, str):
        try: prev_actions = json.loads(prev_actions)
        except: prev_actions = [prev_actions]
    
    for idx, act in enumerate(prev_actions, 1):
        elements.append(Paragraph(f"<b>{idx}.</b> {act}", body_style))
    elements.append(Spacer(1, 20))

    # Footer Disclaimer
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceBefore=10, spaceAfter=8))
    footer_text = "Generated by SafeSense Safety Intelligence System • Non-medical, non-legal decision support prototype."
    elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=body_style, fontSize=8, textColor=colors.HexColor('#94A3B8'), alignment=1)))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
