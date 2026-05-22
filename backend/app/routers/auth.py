from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# ── Schemas ───────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class UserOut(BaseModel):
    id:     int
    nombre: str
    email:  str
    role:   str

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut

# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Detecta el rol automáticamente según las credenciales.
    No hay selector de rol visible en el frontend.
    """
    user = db.query(User).filter(
        User.email == body.email,
        User.activo == True
    ).first()

    if not user or not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "user": user}

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    # JWT es stateless; el cliente elimina el token
    return {"message": "Sesión cerrada"}
