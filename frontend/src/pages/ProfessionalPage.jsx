import React, { useState } from 'react';
import '../styles/profesional.css';
import { motion, AnimatePresence } from 'framer-motion';

// ── DATOS MOCK ──────────────────────────────────────────
const PROFESSIONAL = {
  name: 'María García',
  role: 'Esteticista',
  initials: 'MG',
  phone: '+57 310 000 0000',
  email: 'maria@entremanos.com',
  description: 'Especialista en tratamientos faciales y corporales con más de 5 años de experiencia.',
};

const APPOINTMENTS = [
  { id:1, client:'Carolina Díaz',   service:'Facial hidratante', hour:'09:00', end:'10:00', status:'conf', day:1, obs:'Piel sensible' },
  { id:2, client:'Valentina López', service:'Manicure completa', hour:'10:30', end:'11:15', status:'pend', day:1, obs:'' },
  { id:3, client:'Isabella Mora',   service:'Masaje relajante',  hour:'12:00', end:'13:15', status:'conf', day:2, obs:'Primera vez' },
  { id:4, client:'Camila Ruiz',     service:'Pedicure spa',      hour:'14:00', end:'15:30', status:'done', day:3, obs:'' },
  { id:5, client:'Natalia Cruz',    service:'Depilación cejas',  hour:'16:00', end:'16:30', status:'canc', day:4, obs:'' },
];

const DIAS_CONFIG = [
  { key:'lunes',     label:'Lunes',     on:true,  open:'09:00', close:'18:00' },
  { key:'martes',    label:'Martes',    on:true,  open:'09:00', close:'18:00' },
  { key:'miercoles', label:'Miércoles', on:true,  open:'09:00', close:'18:00' },
  { key:'jueves',    label:'Jueves',    on:true,  open:'09:00', close:'18:00' },
  { key:'viernes',   label:'Viernes',   on:true,  open:'09:00', close:'17:00' },
  { key:'sabado',    label:'Sábado',    on:true,  open:'09:00', close:'13:00' },
  { key:'domingo',   label:'Domingo',   on:false, open:'',      close:''      },
];

const BLOCKED = [
  { id:1, label:'Mar 27 May — 14:00 a 16:00 — Descanso' },
  { id:2, label:'Jue 29 May — 10:00 a 11:00 — Capacitación' },
];

const DAYS  = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
const STATUS_LABEL = { conf:'Confirmada', pend:'Pendiente', canc:'Cancelada', done:'Finalizada' };
const STATUS_COLOR = { conf:'#4A7C59', pend:'#C9A84C', canc:'#D94F4F', done:'#B0A99F' };

const today = new Date();
const todayStr = today.toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

// ── COMPONENTE PRINCIPAL ────────────────────────────────
export default function ProfessionalPage() {
  const [view,        setView]        = useState('inicio');
  const [agendaTab,   setAgendaTab]   = useState('hoy');
  const [currentStatus, setCurrentStatus] = useState('disponible');
  const [days,        setDays]        = useState(DIAS_CONFIG);
  const [blocked,     setBlocked]     = useState(BLOCKED);
  const [modalAppt,   setModalAppt]   = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [toast,       setToast]       = useState('');
  const [toastShow,   setToastShow]   = useState(false);
  const [notifWa,     setNotifWa]     = useState(true);
  const [notifEmail,  setNotifEmail]  = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2800);
  };

  const toggleDay = (i) => {
    const updated = [...days];
    updated[i] = { ...updated[i], on: !updated[i].on };
    setDays(updated);
  };

  const removeBlocked = (id) => {
    setBlocked(blocked.filter(b => b.id !== id));
    showToast('Bloqueo eliminado');
  };

  const todayAppts = APPOINTMENTS.filter(a => a.day === 1);
  const filteredClients = APPOINTMENTS.filter(a =>
    a.client.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const navItems = [
    { key:'inicio',        label:'Inicio'         },
    { key:'agenda',        label:'Mi Agenda'      },
    { key:'disponibilidad',label:'Disponibilidad' },
    { key:'clientes',      label:'Clientes del día'},
    { key:'perfil',        label:'Mi Perfil'      },
  ];

  return (
    <motion.div
    className="prof-app"
    initial={{ opacity:0 }}
    animate={{ opacity:1 }}
    transition={{ duration:.3 }}
    >

      {/* ── SIDEBAR ── */}
      <aside className="prof-sidebar">
        <div className="prof-sidebar-logo">
          <div className="prof-sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
          </div>
          <div className="prof-sidebar-logo-text">Entre<span>Manos</span></div>
        </div>

        <nav className="prof-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`prof-nav-item ${view === item.key ? 'active' : ''}`}
              onClick={() => setView(item.key)}
            >
              <NavIcon name={item.key} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="prof-sidebar-bottom">
          <button className="prof-logout-btn" onClick={() => showToast('Sesión cerrada')}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── HEADER ── */}
      <header className="prof-header">
        <div className="prof-header-left">
          <div className="prof-header-name">{PROFESSIONAL.name}</div>
          <div className="prof-header-role">{PROFESSIONAL.role}</div>
        </div>
        <div className="prof-header-right">
          <div className="prof-header-date">{todayStr}</div>
          <button className="prof-notif-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="prof-notif-badge">2</span>
          </button>
          <div className="prof-avatar">{PROFESSIONAL.initials}</div>
        </div>
      </header>

      {/* ── CONTENIDO ── */}
      <motion.main
        className="prof-content"
        key={view}
        initial={{ opacity:0, y:14 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:.25 }}
      >

        {view === 'inicio' && (
          <InicioView
            appts={todayAppts}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            onApptClick={setModalAppt}
          />
        )}

        {view === 'agenda' && (
          <AgendaView
            appts={APPOINTMENTS}
            agendaTab={agendaTab}
            setAgendaTab={setAgendaTab}
            onApptClick={setModalAppt}
            showToast={showToast}
          />
        )}

        {view === 'disponibilidad' && (
          <DisponibilidadView
            days={days}
            toggleDay={toggleDay}
            blocked={blocked}
            removeBlocked={removeBlocked}
            showToast={showToast}
          />
        )}

        {view === 'clientes' && (
          <ClientesView
            appts={filteredClients}
            search={clientSearch}
            setSearch={setClientSearch}
            onApptClick={setModalAppt}
          />
        )}

        {view === 'perfil' && (
          <PerfilView
            professional={PROFESSIONAL}
            notifWa={notifWa}
            setNotifWa={setNotifWa}
            notifEmail={notifEmail}
            setNotifEmail={setNotifEmail}
            showToast={showToast}
          />
        )}
      </motion.main>

      {/* ── MODAL DETALLE CITA ── */}
      <AnimatePresence>
          {modalAppt && (
            <motion.div
              className="modal-overlay open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) =>
                e.target === e.currentTarget && setModalAppt(null)
              }
            >
              <motion.div
                className="modal"
                initial={{ opacity: 0, scale: 0.93, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 16 }}
                transition={{ duration: 0.22 }}
              >
                <div className="modal-header">
                  <div className="modal-title">Detalle de cita</div>
                  <button
                    className="modal-close"
                    onClick={() => setModalAppt(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-detail-row">
                  <div className="modal-detail-label">Cliente</div>
                  <div className="modal-detail-value">{modalAppt.client}</div>
                </div>

                <div className="modal-detail-row">
                  <div className="modal-detail-label">Servicio</div>
                  <div className="modal-detail-value">{modalAppt.service}</div>
                </div>

                <div className="modal-detail-row">
                  <div className="modal-detail-label">Hora</div>
                  <div className="modal-detail-value">
                    {modalAppt.hour} — {modalAppt.end}
                  </div>
                </div>

                <div className="modal-detail-row">
                  <div className="modal-detail-label">Estado</div>
                  <div className="modal-detail-value">
                    <span className={`status-badge ${modalAppt.status}`}>
                      {STATUS_LABEL[modalAppt.status]}
                    </span>
                  </div>
                </div>

                {modalAppt.obs && (
                  <div className="modal-detail-row">
                    <div className="modal-detail-label">Observaciones</div>
                    <div className="modal-detail-value">
                      {modalAppt.obs}
                    </div>
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    className="btn-secondary"
                    onClick={() => setModalAppt(null)}
                  >
                    Cerrar
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => {
                      showToast('Estado actualizado');
                      setModalAppt(null);
                    }}
                  >
                    Marcar finalizada
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* ── TOAST ── */}
      <div className={`toast ${toastShow ? 'show' : ''}`}>{toast}</div>
    </motion.div>
  );
}

// ── VISTA INICIO ────────────────────────────────────────
function InicioView({ appts, currentStatus, setCurrentStatus }) {
  const statCards = [
    { label:'Citas hoy',      value: appts.length,  sub:'programadas',      icon:'calendar', color:'green'  },
    { label:'Horas ocupadas', value:'4.5h',          sub:'de 9h disponibles', icon:'clock',    color:'gold'   },
    { label:'Clientes hoy',   value: appts.length,  sub:'confirmados',       icon:'users',    color:'purple' },
    { label:'Próxima cita',   value:'10:30',         sub:'Valentina López',   icon:'bell',     color:'blue'   },
  ];

  return (
    <>
      <div className="section-header">
        <div>
          <div className="section-title">Buenos días, María</div>
          <div className="section-sub">Aquí tienes el resumen de tu día</div>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((c, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-label">{c.label}</div>
              <div className={`stat-card-icon ${c.color}`}>
                <StatIcon name={c.icon} />
              </div>
            </div>
            <div className="stat-card-value">{c.value}</div>
            <div className="stat-card-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="timeline-card">
          <div className="section-header" style={{marginBottom:'16px'}}>
            <div className="section-title" style={{fontSize:'15px'}}>Timeline del día</div>
            <div className="status-selector">
              {['disponible','ocupado','descanso'].map(s => (
                <button
                  key={s}
                  className={`status-pill ${s} ${currentStatus === s ? 'active' : ''}`}
                  onClick={() => setCurrentStatus(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="timeline">
            {appts.length === 0 && (
              <div style={{textAlign:'center',color:'var(--tx2)',padding:'32px',fontSize:'13px'}}>
                Sin citas programadas para hoy
              </div>
            )}
            {appts.map((a, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" style={{background: STATUS_COLOR[a.status]}}>
                  {i + 1}
                </div>
                <div className="timeline-body">
                  <div className="timeline-time">{a.hour} — {a.end}</div>
                  <div className="timeline-client">{a.client}</div>
                  <div className="timeline-service">{a.service}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <div className="right-card">
            <div className="right-card-title">Próximos clientes</div>
            {appts.map((a, i) => (
              <div key={i} className="next-client-item">
                <div className="mini-avatar">
                  {a.client.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="next-client-name">{a.client.split(' ')[0]}</div>
                <div className="next-client-time">{a.hour}</div>
              </div>
            ))}
          </div>

          <div className="right-card">
            <div className="right-card-title">Recordatorios</div>
            {[
              { text:'Cita con Carolina en 30 minutos', color:'var(--pri)' },
              { text:'Reunión de equipo a las 15:00',   color:'var(--acc)' },
            ].map((r, i) => (
              <div key={i} className="reminder-item">
                <div className="reminder-dot" style={{background: r.color}}></div>
                <div className="reminder-text">{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── VISTA AGENDA ────────────────────────────────────────
function AgendaView({ appts, agendaTab, setAgendaTab, onApptClick, showToast }) {
  const dates = [26,27,28,29,30,31,1];

  return (
    <>
      <div className="agenda-header">
        <div className="section-title">Mi Agenda</div>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div className="week-nav">
            <button className="week-nav-btn">&#8249;</button>
            <div className="week-label">26 May – 1 Jun 2026</div>
            <button className="week-nav-btn">&#8250;</button>
          </div>
          <div className="filter-tabs">
            {['hoy','semana','mes'].map(t => (
              <button key={t} className={`filter-tab ${agendaTab === t ? 'active' : ''}`}
                onClick={() => setAgendaTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cal-grid">
        <div className="cal-head-row">
          <div className="cal-head-cell"></div>
          {DAYS.map((d, i) => (
            <div key={i} className={`cal-head-cell ${i === 0 ? 'today' : ''}`}>
              <div>{d}</div>
              <span>{dates[i]}</span>
            </div>
          ))}
        </div>

        {HOURS.map((h, hi) => (
          <div key={h} className="cal-body-row">
            <div className="cal-time-cell">{h}</div>
            {DAYS.map((_, di) => {
              const appt = appts.find(a =>
                a.day === di + 1 && a.hour.startsWith(h.slice(0,2))
              );
              return (
                <div key={di} className="cal-cell" onClick={() => appt && onApptClick(appt)}>
                  {appt && (
                    <div
                      className="cal-appt"
                      style={{
                        background: `${STATUS_COLOR[appt.status]}18`,
                        borderLeft: `3px solid ${STATUS_COLOR[appt.status]}`,
                        height: '44px',
                      }}
                    >
                      <div className="cal-appt-client" style={{color: STATUS_COLOR[appt.status]}}>
                        {appt.client.split(' ')[0]}
                      </div>
                      <div className="cal-appt-service">{appt.service}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <button className="fab" onClick={() => showToast('Selecciona un horario para bloquearlo')}>
        +
      </button>
    </>
  );
}

// ── VISTA DISPONIBILIDAD ────────────────────────────────
function DisponibilidadView({ days, toggleDay, blocked, removeBlocked, showToast }) {
  return (
    <>
      <div className="section-header" style={{marginBottom:'20px'}}>
        <div>
          <div className="section-title">Disponibilidad</div>
          <div className="section-sub">Configura tus horarios y bloqueos</div>
        </div>
        <button className="save-btn" onClick={() => showToast('Horarios guardados correctamente')}>
          Guardar cambios
        </button>
      </div>

      <div className="avail-section">
        <div className="avail-title">Horarios de atención</div>
        {days.map((d, i) => (
          <div key={d.key} className="day-row">
            <div className="day-name">{d.label}</div>
            <button className={`toggle ${d.on ? 'on' : 'off'}`} onClick={() => toggleDay(i)}>
              <div className="toggle-dot"></div>
            </button>
            {d.on ? (
              <div className="time-pair">
                <input className="time-input" type="time" defaultValue={d.open} />
                <span className="time-sep">→</span>
                <input className="time-input" type="time" defaultValue={d.close} />
              </div>
            ) : (
              <span className="day-inactive">Día no disponible</span>
            )}
          </div>
        ))}
      </div>

      <div className="avail-section">
        <div className="avail-title">Bloquear horario específico</div>
        <div className="form-row" style={{marginBottom:'12px'}}>
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input className="form-input" type="date" />
          </div>
          <div className="form-group">
            <label className="form-label">Motivo</label>
            <input className="form-input" type="text" placeholder="Ej: Descanso, Capacitación..." />
          </div>
        </div>
        <div className="form-row" style={{marginBottom:'16px'}}>
          <div className="form-group">
            <label className="form-label">Hora inicio</label>
            <input className="form-input" type="time" />
          </div>
          <div className="form-group">
            <label className="form-label">Hora fin</label>
            <input className="form-input" type="time" />
          </div>
        </div>
        <button className="save-btn" onClick={() => showToast('Bloqueo agregado')}>
          Agregar bloqueo
        </button>

        <div style={{marginTop:'20px'}}>
          <div style={{fontSize:'13px', fontWeight:'600', color:'var(--tx)', marginBottom:'12px'}}>
            Bloqueos activos
          </div>
          <div className="blocked-list">
            {blocked.map(b => (
              <div key={b.id} className="blocked-chip">
                <span className="blocked-chip-icon">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                {b.label}
                <span className="blocked-chip-remove" onClick={() => removeBlocked(b.id)}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── VISTA CLIENTES DEL DÍA ──────────────────────────────
function ClientesView({ appts, search, setSearch, onApptClick }) {
  return (
    <>
      <div className="section-header" style={{marginBottom:'20px'}}>
        <div>
          <div className="section-title">Clientes del día</div>
          <div className="section-sub">{appts.length} clientes encontrados</div>
        </div>
      </div>

      <div className="clients-search">
        <span className="clients-search-icon">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="clients-table-wrap">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {appts.map((a, i) => (
              <tr key={i} onClick={() => onApptClick(a)}>
                <td>
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <div className="mini-avatar">
                      {a.client.split(' ').map(n => n[0]).join('')}
                    </div>
                    <strong>{a.client}</strong>
                  </div>
                </td>
                <td>{a.service}</td>
                <td style={{fontWeight:'500'}}>{a.hour}</td>
                <td>
                  <span className={`status-badge ${a.status}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </td>
                <td style={{color:'var(--tx2)'}}>
                  {a.obs || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── VISTA PERFIL ────────────────────────────────────────
function PerfilView({ professional, notifWa, setNotifWa, notifEmail, setNotifEmail, showToast }) {
  return (
    <>
      <div className="section-header" style={{marginBottom:'24px'}}>
        <div>
          <div className="section-title">Mi Perfil</div>
          <div className="section-sub">Gestiona tu información personal</div>
        </div>
        <button className="save-btn" onClick={() => showToast('Cambios guardados correctamente')}>
          Guardar cambios
        </button>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">{professional.initials}</div>
            <div className="profile-avatar-info">
              <h3>{professional.name}</h3>
              <p>{professional.role}</p>
            </div>
            <button className="profile-change-photo" onClick={() => showToast('Selector de imagen')}>
              Cambiar foto
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input className="form-input" type="text" defaultValue={professional.name} />
            </div>
            <div className="form-group">
              <label className="form-label">Especialidad</label>
              <input className="form-input" type="text" defaultValue={professional.role} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" type="tel" defaultValue={professional.phone} />
            </div>
            <div className="form-group">
              <label className="form-label">Correo</label>
              <input className="form-input" type="email" defaultValue={professional.email} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción profesional</label>
            <textarea
              className="form-input"
              rows="3"
              style={{resize:'none'}}
              defaultValue={professional.description}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nueva contraseña</label>
            <input className="form-input" type="password" placeholder="Dejar en blanco para no cambiar" />
          </div>
        </div>

        <div className="config-card">
          <div className="config-title">Notificaciones</div>

          {[
            {
              label: 'WhatsApp',
              sub:   'Recibir recordatorios por WhatsApp',
              val:   notifWa,
              set:   setNotifWa,
            },
            {
              label: 'Email',
              sub:   'Recibir notificaciones por correo',
              val:   notifEmail,
              set:   setNotifEmail,
            },
          ].map((item, i) => (
            <div key={i} className="config-item">
              <div>
                <div className="config-item-label">{item.label}</div>
                <div className="config-item-sub">{item.sub}</div>
              </div>
              <button
                className={`toggle ${item.val ? 'on' : 'off'}`}
                onClick={() => { item.set(!item.val); showToast(`Notificaciones ${item.label} ${!item.val ? 'activadas' : 'desactivadas'}`); }}
              >
                <div className="toggle-dot"></div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── ICONOS ──────────────────────────────────────────────
function NavIcon({ name }) {
  const icons = {
    inicio:         <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    agenda:         <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    disponibilidad: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
    clientes:       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    perfil:         <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };
  return icons[name] || null;
}

function StatIcon({ name }) {
  const icons = {
    calendar: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
    users:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    bell:     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  };
  return icons[name] || null;
}