# ✦ Entre Manos — Sistema de Agendamiento

> Spa & Estética · Proyecto académico IS2 2026

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + React Router |
| Backend | Python + FastAPI |
| Base de datos | MySQL (Railway) |
| Autenticación | JWT con detección automática de rol |
| Notificaciones | Twilio (WhatsApp) + Gmail SMTP |
| Despliegue | Railway / Render |
| Diseño | Figma |

---

## 🚀 Cómo correr el proyecto localmente

### Requisitos
- Node.js 18+
- Python 3.11+
- MySQL corriendo localmente o cuenta en Railway

### 1. Clonar y configurar variables de entorno

```bash
git clone https://github.com/is2-2025-grupoENTREMANOS/mvp-proyecto.git
cd mvp-proyecto
```

```bash
# Copiar y completar el .env del backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de MySQL, Twilio, Gmail
```

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

La API estará en: http://localhost:8000  
Documentación automática: http://localhost:8000/api/docs

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

El frontend estará en: http://localhost:5173

---

## 📁 Estructura del proyecto

```
mvp-proyecto/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── pages/             # LoginPage, AdminDashboard, BookingPage...
│   │   ├── components/        # Componentes reutilizables
│   │   ├── context/           # AuthContext (manejo de sesión)
│   │   ├── services/          # api.js (Axios + endpoints)
│   │   └── hooks/             # Custom hooks
│   └── index.html
│
├── backend/                   # FastAPI
│   ├── app/
│   │   ├── main.py            # Punto de entrada
│   │   ├── core/              # Config, DB, Security (JWT)
│   │   ├── models/            # Tablas SQLAlchemy (User, Appointment...)
│   │   ├── routers/           # Endpoints por módulo
│   │   ├── schemas/           # Pydantic (validación de datos)
│   │   └── services/          # Notificaciones (Twilio + Gmail)
│   └── requirements.txt
│
└── README.md
```

## 👥 Roles del sistema

| Rol | Acceso |
|-----|--------|
| `admin` | Panel completo: empleados, servicios, citas, reportes |
| `profesional` | Agenda diaria, disponibilidad en tiempo real |
| Cliente | Booking público sin login |

El rol se detecta **automáticamente** con las credenciales — no hay selector visible.

---

## 📋 Módulos del WBS

- [x] Configuración base del proyecto
- [x] Módulo de autenticación (Login + JWT)
- [ ] Módulo del Cliente (agendamiento)
- [ ] Módulo del Profesional (agenda diaria)
- [ ] Módulo del Administrador (dashboard)
- [ ] Notificaciones WhatsApp + Email
- [ ] Pruebas y despliegue en Railway

---

*Proyecto académico — Ingeniería del Software II 2026*
