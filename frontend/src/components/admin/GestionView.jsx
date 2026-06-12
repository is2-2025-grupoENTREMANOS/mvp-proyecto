import React from 'react';
import ProfesionalesTab from './ProfesionalesTab';
import ServiciosTab     from './ServiciosTab';
import HorariosTab      from './HorariosTab';
import ClientesTab      from './ClientesTab';

export default function GestionView({
  professionals, setProfessionals,
  services, setServices,
  loadingProfs, loadingServices,
  gestionTab, setGestionTab,
  showToast,
  businessConfig, setBusinessConfig,
}) {
  const tabs   = ['profesionales','servicios','clientes','horarios','whatsapp'];
  const labels = ['Profesionales','Servicios','Clientes','Horarios','Notificaciones'];

  return (
    <>
      <div className="agenda-header">
        <div className="agenda-title">Gestión</div>
      </div>

      <div className="gestion-tabs">
        {tabs.map((t, i) => (
          <button key={t}
            className={`gestion-tab ${gestionTab === t ? 'active' : ''}`}
            onClick={() => setGestionTab(t)}>
            {labels[i]}
          </button>
        ))}
      </div>

      {gestionTab === 'profesionales' && (
        <ProfesionalesTab
          professionals={professionals}
          setProfessionals={setProfessionals}
          loadingProfs={loadingProfs}
          showToast={showToast}
        />
      )}

      {gestionTab === 'servicios' && (
        <ServiciosTab
          services={services}
          setServices={setServices}
          loadingServices={loadingServices}
          showToast={showToast}
        />
      )}

      {gestionTab === 'clientes' && (
        <ClientesTab showToast={showToast} />
      )}

      {gestionTab === 'horarios' && (
        <HorariosTab
          businessConfig={businessConfig}
          setBusinessConfig={setBusinessConfig}
          showToast={showToast}
        />
      )}

      {gestionTab === 'whatsapp' && (
        <div className="wa-card">
          <div className="wa-header">
            <div className="wa-title">Notificaciones WhatsApp (Twilio)</div>
          </div>
          <div style={{ fontSize:'13px', color:'var(--tx2)', padding:'12px 0' }}>
            Integración disponible en Fase 3.
          </div>
        </div>
      )}
    </>
  );
}