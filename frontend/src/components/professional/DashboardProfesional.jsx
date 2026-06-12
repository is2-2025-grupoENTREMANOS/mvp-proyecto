import React, { useEffect, useState } from "react";
import { appointmentsAPI } from "../../services/api";

export default function DashboardProfesional() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      // CAMBIA EL ID SI LO NECESITAS
      const res = await appointmentsAPI.getByProfessional(1);

      setAppointments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const hoy = new Date().toDateString();

  const citasHoy = appointments.filter(
    (a) =>
      new Date(a.fecha_inicio).toDateString() === hoy
  );

  const pendientes = appointments.filter(
    (a) => a.estado === "pendiente"
  );

  const confirmadas = appointments.filter(
    (a) => a.estado === "confirmada"
  );

  return (
    <div>
      <div className="prof-hero">
        <h1>Bienvenida</h1>
        <p>Resumen de tu día</p>
      </div>

      <div className="prof-stats">
        <div className="prof-stat-card">
          <h3>Citas hoy</h3>
          <h2>{citasHoy.length}</h2>
        </div>

        <div className="prof-stat-card">
          <h3>Pendientes</h3>
          <h2>{pendientes.length}</h2>
        </div>

        <div className="prof-stat-card">
          <h3>Confirmadas</h3>
          <h2>{confirmadas.length}</h2>
        </div>
      </div>

      <div className="prof-section">
        <h2>Próximas citas</h2>

        {appointments.length === 0 ? (
          <p>No hay citas</p>
        ) : (
          appointments.slice(0, 5).map((cita) => (
            <div className="timeline-card" key={cita.id}>
              <div>
                <strong>
                  {cita.client?.nombre || "Cliente"}
                </strong>

                <p>
                  {new Date(
                    cita.fecha_inicio
                  ).toLocaleString()}
                </p>

                <span className={`status-badge ${cita.estado}`}>
                  {cita.estado}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}