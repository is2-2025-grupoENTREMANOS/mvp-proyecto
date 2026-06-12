# Backend
## Pruebas automatizadas

### Requisitos previos
Tener el usuario admin creado (POST /auth/seed) y la base de datos activa.

### Instalar dependencias de pruebas
pip install pytest httpx

### Ejecutar todas las pruebas
pytest tests/ -v

### Ejecutar por tipo
pytest tests/unit/test_security.py -v          # Pruebas unitarias 
pytest tests/test_e2e.py -v           # Pruebas End-to-End

### Descripción
| Archivo | Tipo | Qué cubre |
|---|---|---|
| test_unit.py | Unitaria | Hash y verificación de contraseñas, JWT |
| test_integration.py | Integración | Endpoints + persistencia en MySQL |
| test_e2e.py | E2E | Flujos completos login → crear → verificar |