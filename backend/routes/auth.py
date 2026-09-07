from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas import LoginRequest, LoginResponse
from backend.models import User

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email = request.email.strip().lower()
    password = request.password.strip()

    user = db.query(User).filter(User.email == email).first()
    if not user or user.password != password:
        # For simple local demo auth fallback:
        if email == "admin@safesense.com" and password == "admin123":
            return LoginResponse(
                success=True,
                token="demo-admin-token-safesense-2026",
                user={
                    "name": "Safety Admin",
                    "email": "admin@safesense.com",
                    "role": "Lead Safety Officer"
                },
                message="Login successful"
            )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return LoginResponse(
        success=True,
        token=f"user-token-{user.id}",
        user={
            "name": user.name,
            "email": user.email,
            "role": user.role
        },
        message="Login successful"
    )
