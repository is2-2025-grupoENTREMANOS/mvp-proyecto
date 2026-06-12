import React from "react";

export default function SidebarProfesional({ tab, setTab }) {
  return (
    <aside className="prof-sidebar">
      <h2 className="prof-brand">EntreManos</h2>

      <div className="prof-menu">
        <button
          className={tab === "dashboard" ? "active" : ""}
          onClick={() => setTab("dashboard")}
        >
          Inicio
        </button>

        <button
          className={tab === "agenda" ? "active" : ""}
          onClick={() => setTab("agenda")}
        >
          Mi Agenda
        </button>

        <button
          className={tab === "citas" ? "active" : ""}
          onClick={() => setTab("citas")}
        >
          Clientes del día
        </button>

        <button
          className={tab === "horarios" ? "active" : ""}
          onClick={() => setTab("horarios")}
        >
          Disponibilidad
        </button>

        <button
          className={tab === "perfil" ? "active" : ""}
          onClick={() => setTab("perfil")}
        >
          Mi Perfil
        </button>
      </div>
    </aside>
  );
}