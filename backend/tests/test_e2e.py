"""
PRUEBAS END-TO-END — Flujos completos del sistema
Entre Manos — Sistema de Agendamiento
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


class TestFlujoAutenticacionYServicio:
    """
    Prueba E2E 1: Login → Crear Servicio → Verificar en listado público
    """

    def setup_method(self):
        """Crea un cliente fresco para cada prueba."""
        self.client = TestClient(app)

    def test_flujo_login_crear_servicio_verificar(self):
        # PASO 1: Login
        login_response = self.client.post("/auth/login", json={
            "email": "admin@entremanos.com",
            "password": "1234",
        })
        assert login_response.status_code == 200, (
            f"Paso 1 falló: Login no exitoso. "
            f"Respuesta: {login_response.json()}"
        )

        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # PASO 2: Verificar identidad
        me_response = self.client.get("/auth/me", headers=headers)
        assert me_response.status_code == 200, "Paso 2 falló: /auth/me"
        assert me_response.json()["rol"] == "admin", "Paso 2 falló: rol incorrecto"

        # PASO 3: Crear servicio
        svc_response = self.client.post("/services/", json={
            "nombre": "Servicio E2E Flujo Completo",
            "descripcion": "Creado en prueba E2E automatizada",
            "duracion": 60,
            "precio": 120000,
        }, headers=headers)
        assert svc_response.status_code == 201, (
            f"Paso 3 falló: Servicio no creado. "
            f"Respuesta: {svc_response.json()}"
        )

        servicio_id = svc_response.json()["id"]

        # PASO 4: Verificar en listado público
        listado_response = self.client.get("/services/")
        assert listado_response.status_code == 200, "Paso 4 falló: listado"

        ids = [s["id"] for s in listado_response.json()]
        assert servicio_id in ids, (
            "Paso 4 falló: el servicio no aparece en el listado público"
        )


class TestFlujoRegistroYConsultaProfesional:
    """
    Prueba E2E 2: Login → Crear Servicio → Crear Profesional → Verificar relación
    """

    def setup_method(self):
        """Crea un cliente fresco para cada prueba."""
        self.client = TestClient(app)

    def test_flujo_crear_profesional_con_servicio_asignado(self):
        # PASO 1: Login
        login_response = self.client.post("/auth/login", json={
            "email": "admin@entremanos.com",
            "password": "1234",
        })
        assert login_response.status_code == 200, (
            f"Paso 1 falló: Login. "
            f"Respuesta: {login_response.json()}"
        )

        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # PASO 2: Crear servicio de prueba
        svc_response = self.client.post("/services/", json={
            "nombre": "Servicio para profesional E2E",
            "descripcion": "Servicio de prueba para E2E",
            "duracion": 45,
            "precio": 90000,
        }, headers=headers)
        assert svc_response.status_code == 201, (
            f"Paso 2 falló: Crear servicio. "
            f"Respuesta: {svc_response.json()}"
        )
        servicio_id = svc_response.json()["id"]

        # PASO 3: Crear profesional con servicio asignado
        prof_response = self.client.post("/professionals/", json={
            "nombre": "Profesional E2E Con Servicio",
            "especialidad": "Esteticista E2E",
            "service_ids": [servicio_id],
        }, headers=headers)
        assert prof_response.status_code == 201, (
            f"Paso 3 falló: Crear profesional. "
            f"Respuesta: {prof_response.json()}"
        )

        profesional_id = prof_response.json()["id"]
        servicios_asignados = prof_response.json()["services"]

        # PASO 4: Verificar que el servicio quedó asignado
        ids_asignados = [s["id"] for s in servicios_asignados]
        assert servicio_id in ids_asignados, (
            "Paso 4 falló: el servicio no quedó asignado al profesional. "
            "Verifica la tabla professional_services en MySQL."
        )

        # PASO 5: Verificar en listado público
        listado_response = self.client.get("/professionals/")
        assert listado_response.status_code == 200, "Paso 5 falló: listado"

        ids = [p["id"] for p in listado_response.json()]
        assert profesional_id in ids, (
            "Paso 5 falló: el profesional no aparece en el listado público"
        )