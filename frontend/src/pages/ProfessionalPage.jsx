import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, professionalsAPI, settingsAPI } from '../services/api';
import '../styles/profesional.css';

// ── Constantes visuales únicas del profesional ──────────────────
const STATUS_LABEL = {
  pendiente:  'Pendiente',
  confirmada: 'Confirmada',
  cancelada:  'Cancelada',
  completada: 'Finalizada',
  en_espera:  'En espera',
};
const STATUS_CLASS = {
  pendiente:  'pend',
  confirmada: 'conf',
  cancelada:  'canc',
  completada: 'done',
  en_espera:  'pend',
};
const STATUS_COLOR = {
  pendiente:  '#C9A84C',
  confirmada: '#4A7C59',
  cancelada:  '#D94F4F',
  completada: '#B0A99F',
  en_espera:  '#3B82F6',
};

// ── Días de disponibilidad por defecto ─────────────────────────
const DIAS_DEFAULT = [
  { key:'lunes',     label:'Lunes',     on:true,  open:'09:00', close:'18:00' },
  { key:'martes',    label:'Martes',    on:true,  open:'09:00', close:'18:00' },
  { key:'miercoles', label:'Miércoles', on:true,  open:'09:00', close:'18:00' },
  { key:'jueves',    label:'Jueves',    on:true,  open:'09:00', close:'18:00' },
  { key:'viernes',   label:'Viernes',   on:true,  open:'09:00', close:'17:00' },
  { key:'sabado',    label:'Sábado',    on:true,  open:'09:00', close:'13:00' },
  { key:'domingo',   label:'Domingo',   on:false, open:'',      close:''      },
];

// ── Genera slots de hora desde settings reales ─────────────────
function generateHourSlots(opening = '09:00', closing = '19:00', slotMin = 60) {
  const slots = [];
  const [oh, om] = opening.split(':').map(Number);
  const [ch, cm] = closing.split(':').map(Number);
  let curr = oh * 60 + om;
  const end = ch * 60 + cm;
  while (curr < end) {
    const h = String(Math.floor(curr / 60)).padStart(2, '0');
    const m = String(curr % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    curr += slotMin;
  }
  return slots;
}

// ── Semana actual real ─────────────────────────────────────────
function getCurrentWeekDays() {
  const today = new Date();
  const dow   = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

// ── COMPONENTE PRINCIPAL ────────────────────────────────────────
export default function ProfessionalPage() {

  const { user, logout } = useAuth();

  // ── Navegación ──
  const [view,      setView]      = useState('inicio');
  const [agendaTab, setAgendaTab] = useState('semana');

  // ── Datos reales de la API ──
  const [professional,  setProfessional]  = useState(null);
  const [appointments,  setAppointments]  = useState([]);
  const [settings,      setSettings]      = useState({
    opening_time: '09:00',
    closing_time: '19:00',
    slot_duration: 60,
  });

  // ── Estado local ──
  const [days,         setDays]         = useState(DIAS_DEFAULT);
  const [blocked,      setBlocked]      = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [modalAppt,    setModalAppt]    = useState(null);
  const [modalPago,    setModalPago]    = useState(null);  // modal completar cita
  const [pagoRestante, setPagoRestante] = useState('');
  const [metodoPago,   setMetodoPago]   = useState('efectivo');

  // ── Loading ──
  const [loadingProf,  setLoadingProf]  = useState(true);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [updatingAppt, setUpdatingAppt] = useState(false);

  // ── Toast ──
  const [toast,     setToast]     = useState('');
  const [toastShow, setToastShow] = useState(false);

  // ── Notificaciones perfil ──
  const [notifWa,    setNotifWa]    = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2800);
  }, []);

  // ── Cargar configuración del negocio ─────────────────────────
  useEffect(() => {
    settingsAPI.getBusiness()
      .then(res => setSettings(res.data))
      .catch(() => {});
  }, []);

  // ── Cargar profesional vinculado al user.id ───────────────────
  // FIX CRÍTICO: busca por user_id, no por professional_id directo
  useEffect(() => {
    if (!user?.id) return;
    setLoadingProf(true);

    professionalsAPI.getPublic()
      .then(res => {
        // Busca el profesional cuyo user_id === user.id del token
        const match = res.data.find(p => p.user_id === user.id);
        setProfessional(match || null);
        return match;
      })
      .then(match => {
        if (!match) return;
        // Cargar citas de ESE profesional usando su id real
        return appointmentsAPI.getByProfessional(match.id);
      })
      .then(res => {
        if (res) setAppointments(res.data);
      })
      .catch(err => {
        console.error('Error cargando datos:', err);
        showToast('Error al cargar tu información');
      })
      .finally(() => setLoadingProf(false));
  }, [user]);

  // ── Refetch de citas ──────────────────────────────────────────
  const fetchAppointments = useCallback(() => {
    if (!professional?.id) return;
    setLoadingAppts(true);
    appointmentsAPI.getByProfessional(professional.id)
      .then(res => setAppointments(res.data))
      .catch(err => console.error('Error:', err))
      .finally(() => setLoadingAppts(false));
  }, [professional]);

  // Recargar al cambiar de vista
  useEffect(() => {
    if (professional?.id &&
       (view === 'inicio' || view === 'agenda' || view === 'clientes')) {
      fetchAppointments();
    }
  }, [view, professional]);

  // ── Slots y semana dinámica ────────────────────────────────────
  const hourSlots = generateHourSlots(
    settings.opening_time,
    settings.closing_time,
    settings.slot_duration
  );
  const weekDays = getCurrentWeekDays();

  // ── Citas de hoy ──────────────────────────────────────────────
  const today = new Date();
  const todayAppts = appointments.filter(a => {
    const f = new Date(a.fecha_inicio);
    return (
      f.getDate()     === today.getDate()     &&
      f.getMonth()    === today.getMonth()    &&
      f.getFullYear() === today.getFullYear() &&
      a.estado !== 'cancelada'
    );
  }).sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

  // ── Próxima cita ──────────────────────────────────────────────
  const proximaCita = [...todayAppts]
    .filter(a => new Date(a.fecha_inicio) > new Date())
    .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))[0];

  // ── Cambiar estado de una cita ────────────────────────────────
  const updateApptStatus = async (apptId, nuevoEstado) => {
    setUpdatingAppt(true);
    try {
      if (nuevoEstado === 'cancelada') {
        await appointmentsAPI.cancel(apptId);
      } else {
        await appointmentsAPI.update(apptId, { estado: nuevoEstado });
      }
      fetchAppointments();
      setModalAppt(null);
      showToast(`Cita marcada como ${STATUS_LABEL[nuevoEstado]}`);
    } catch (err) {
      showToast(err.userMessage || 'Error al actualizar la cita');
    } finally {
      setUpdatingAppt(false);
    }
  };

  // ── Completar cita con pago restante ─────────────────────────
  const completarCita = async () => {
    if (!modalPago) return;
    const saldoPendiente = Math.max(
      0,
      Number(modalPago.precio_total || 0) - Number(modalPago.abono || 0)
    );

    if (saldoPendiente > 0 && !pagoRestante) {
      showToast('Ingresa el pago recibido por el saldo pendiente');
      return;
    }

    setUpdatingAppt(true);
    try {
      // Actualizar estado a completada
      await appointmentsAPI.update(modalPago.id, {
        estado: 'completada',
        // Si hay saldo, actualizar el abono total
        abono: pagoRestante
          ? Number(modalPago.abono || 0) + parseFloat(pagoRestante)
          : Number(modalPago.abono || 0),
      });
      fetchAppointments();
      setModalPago(null);
      setPagoRestante('');
      showToast('Cita completada correctamente');
    } catch (err) {
      showToast(err.userMessage || 'Error al completar la cita');
    } finally {
      setUpdatingAppt(false);
    }
  };

  // ── Filtrado clientes por búsqueda ─────────────────────────────
  const filteredAppts = appointments.filter(a =>
    (a.client?.nombre || '').toLowerCase().includes(clientSearch.toLowerCase())
  );

  // ── Iniciales del profesional ─────────────────────────────────
  const initials = (professional?.nombre || user?.nombre || 'PR')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const navItems = [
    { key:'inicio',         label:'Inicio'          },
    { key:'agenda',         label:'Mi Agenda'       },
    { key:'disponibilidad', label:'Disponibilidad'  },
    { key:'clientes',       label:'Clientes del día'},
    { key:'perfil',         label:'Mi Perfil'       },
  ];

  // ── Loading inicial ───────────────────────────────────────────
  if (loadingProf) return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', fontFamily:'Inter,sans-serif',
      flexDirection:'column', gap:'14px', color:'var(--tx2)',
      background:'var(--bg)'
    }}>
      <div style={{
        width:'36px', height:'36px',
        border:'3px solid var(--bdr)',
        borderTopColor:'var(--pri)',
        borderRadius:'50%',
        animation:'spin 1s linear infinite'
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ fontSize:'13px' }}>Cargando tu panel...</span>
    </div>
  );

  // ── Si no hay profesional vinculado ───────────────────────────
  if (!professional && !loadingProf) return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', fontFamily:'Inter,sans-serif',
      flexDirection:'column', gap:'16px', color:'var(--tx2)',
      background:'var(--bg)'
    }}>
      <div style={{
        width:'56px', height:'56px', borderRadius:'50%',
        background:'var(--bg2)', display:'flex',
        alignItems:'center', justifyContent:'center',
        fontSize:'24px'
      }}>⚠️</div>
      <div style={{ fontWeight:'600', color:'var(--tx)', fontSize:'16px' }}>
        Perfil no vinculado
      </div>
      <p style={{ fontSize:'13px', textAlign:'center', maxWidth:'320px', lineHeight:'1.6' }}>
        Tu cuenta de usuario no está vinculada a un perfil de profesional.
        Contacta al administrador para vincularte.
      </p>
      <button onClick={logout} style={{
        padding:'10px 24px', background:'var(--pri)', color:'#fff',
        border:'none', borderRadius:'9px', fontSize:'13px',
        fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif'
      }}>
        Cerrar sesión
      </button>
    </div>
  );

  return (
    <motion.div className="prof-app"
      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:.3 }}>

      {/* SIDEBAR */}
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
            <button key={item.key}
              className={`prof-nav-item ${view === item.key ? 'active' : ''}`}
              onClick={() => setView(item.key)}>
              <NavIcon name={item.key} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mini resumen en sidebar */}
        <div style={{
          margin:'16px 0', padding:'14px 12px',
          background:'var(--pri-lt)', borderRadius:'10px'
        }}>
          <div style={{ fontSize:'11px', color:'var(--tx2)', fontWeight:'600',
            textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'8px' }}>
            Hoy
          </div>
          <div style={{ fontSize:'12px', color:'var(--tx)', lineHeight:'1.8' }}>
            <div>Citas: <strong style={{ color:'var(--pri)' }}>
              {todayAppts.length}
            </strong></div>
            <div>Pendientes: <strong style={{ color:'var(--acc)' }}>
              {todayAppts.filter(a => a.estado === 'pendiente').length}
            </strong></div>
            <div>Confirmadas: <strong style={{ color:'var(--pri)' }}>
              {todayAppts.filter(a => a.estado === 'confirmada').length}
            </strong></div>
          </div>
        </div>

        <div className="prof-sidebar-bottom">
          <button className="prof-logout-btn" onClick={logout}>
            <svg width="16" height="16" fill="none" stroke="currentColor"
              strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* HEADER */}
      <header className="prof-header">
        <div className="prof-header-left">
          <div className="prof-header-name">
            {professional?.nombre || user?.nombre || 'Profesional'}
          </div>
          <div className="prof-header-role">
            {professional?.especialidad || 'Especialista'}
          </div>
        </div>
        <div className="prof-header-right">
          <div className="prof-header-date">
            {today.toLocaleDateString('es-CO', {
              weekday:'long', day:'numeric', month:'long', year:'numeric'
            })}
          </div>
          <button className="prof-notif-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor"
              strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {todayAppts.filter(a => a.estado === 'pendiente').length > 0 && (
              <span className="prof-notif-badge">
                {todayAppts.filter(a => a.estado === 'pendiente').length}
              </span>
            )}
          </button>
          <div className="prof-avatar">{initials}</div>
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="professional-layout">

        <motion.main className="professional-content" key={view}
          initial={{ opacity:0, y:12 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:.25 }}>

        {view === 'inicio' && (
          <InicioView
            todayAppts={todayAppts}
            appointments={appointments}
            loadingAppts={loadingAppts}
            proximaCita={proximaCita}
            onApptClick={setModalAppt}
            onCompletarClick={appt => {
              setModalPago(appt);
              setPagoRestante('');
            }}
          />
        )}

        {view === 'agenda' && (
          <AgendaView
            appointments={appointments}
            loadingAppts={loadingAppts}
            agendaTab={agendaTab}
            setAgendaTab={setAgendaTab}
            weekDays={weekDays}
            hourSlots={hourSlots}
            onApptClick={setModalAppt}
            showToast={showToast}
          />
        )}

        {view === 'disponibilidad' && (
          <DisponibilidadView
            days={days}
            setDays={setDays}
            blocked={blocked}
            setBlocked={setBlocked}
            showToast={showToast}
          />
        )}

        {view === 'clientes' && (
          <ClientesView
            appointments={filteredAppts}
            search={clientSearch}
            setSearch={setClientSearch}
            onApptClick={setModalAppt}
            loadingAppts={loadingAppts}
          />
        )}

        {view === 'perfil' && (
          <PerfilView
            professional={professional}
            user={user}
            notifWa={notifWa}    setNotifWa={setNotifWa}
            notifEmail={notifEmail} setNotifEmail={setNotifEmail}
            showToast={showToast}
          />
        )}
      </motion.main>
    </div>

      {/* MODAL DETALLE CITA */}
      <AnimatePresence>
        {modalAppt && (
          <motion.div className="modal-overlay open"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => e.target === e.currentTarget && setModalAppt(null)}>
            <motion.div className="modal"
              initial={{ opacity:0, scale:.93, y:16 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:.93, y:16 }}>

              <div className="modal-header">
                <div className="modal-title">Detalle de cita</div>
                <button className="modal-close" onClick={() => setModalAppt(null)}>✕</button>
              </div>

              {/* Datos de la cita */}
              {[
                ['Cliente',     modalAppt.client?.nombre || '—'],
                ['Servicio',    modalAppt.service?.nombre || '—'],
                ['Inicio',      new Date(modalAppt.fecha_inicio).toLocaleString('es-CO', {
                                  hour:'2-digit', minute:'2-digit',
                                  day:'2-digit', month:'short'
                                })],
                ['Duración',    modalAppt.fecha_fin
                                  ? `${Math.round((new Date(modalAppt.fecha_fin) - new Date(modalAppt.fecha_inicio)) / 60000)} min`
                                  : '—'],
                ['Estado',      'badge'],
                ['Total',       `$${Number(modalAppt.precio_total||0).toLocaleString('es-CO')}`],
                ['Abono',       `$${Number(modalAppt.abono||0).toLocaleString('es-CO')}`],
                ['Saldo',       `$${Math.max(0, Number(modalAppt.precio_total||0) - Number(modalAppt.abono||0)).toLocaleString('es-CO')}`],
                modalAppt.notas ? ['Notas', modalAppt.notas] : null,
                modalAppt.cuestionario ? ['Cuestionario', modalAppt.cuestionario] : null,
              ].filter(Boolean).map(([l, v]) => (
                <div key={l} className="modal-detail-row">
                  <div className="modal-detail-label">{l}</div>
                  <div className="modal-detail-value">
                    {l === 'Estado' ? (
                      <span className={`status-badge ${STATUS_CLASS[modalAppt.estado] || 'pend'}`}>
                        {STATUS_LABEL[modalAppt.estado] || modalAppt.estado}
                      </span>
                    ) : v}
                  </div>
                </div>
              ))}

              {/* Acciones según estado */}
              <div className="modal-footer" style={{ flexWrap:'wrap', gap:'8px' }}>
                <button className="btn-secondary" onClick={() => setModalAppt(null)}>
                  Cerrar
                </button>

                {modalAppt.estado === 'pendiente' && (
                  <button className="btn-primary"
                    disabled={updatingAppt}
                    onClick={() => updateApptStatus(modalAppt.id, 'confirmada')}>
                    {updatingAppt ? '...' : '✓ Confirmar'}
                  </button>
                )}

                {(modalAppt.estado === 'pendiente' || modalAppt.estado === 'confirmada') && (
                  <button className="btn-primary"
                    disabled={updatingAppt}
                    style={{ background:'var(--acc)' }}
                    onClick={() => {
                      setModalAppt(null);
                      setModalPago(modalAppt);
                      setPagoRestante('');
                    }}>
                    Completar cita
                  </button>
                )}

                {modalAppt.estado !== 'cancelada' && modalAppt.estado !== 'completada' && (
                  <button className="btn-secondary"
                    disabled={updatingAppt}
                    style={{ color:'var(--err)', borderColor:'var(--err-lt)' }}
                    onClick={() => updateApptStatus(modalAppt.id, 'cancelada')}>
                    {updatingAppt ? '...' : 'Cancelar'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL COMPLETAR CITA — pago restante */}
      <AnimatePresence>
        {modalPago && (
          <motion.div className="modal-overlay open"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => e.target === e.currentTarget && setModalPago(null)}>
            <motion.div className="modal"
              initial={{ opacity:0, scale:.93, y:16 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:.93, y:16 }}>

              <div className="modal-header">
                <div className="modal-title">Completar cita</div>
                <button className="modal-close" onClick={() => setModalPago(null)}>✕</button>
              </div>

              <p style={{ fontSize:'13px', color:'var(--tx2)', marginBottom:'20px', lineHeight:'1.6' }}>
                Confirma el pago final de{' '}
                <strong style={{ color:'var(--tx)' }}>{modalPago.client?.nombre}</strong>
                {' '}por{' '}
                <strong style={{ color:'var(--tx)' }}>{modalPago.service?.nombre}</strong>.
              </p>

              {/* Resumen financiero */}
              <div style={{
                background:'var(--bg2)', borderRadius:'10px',
                padding:'14px 16px', marginBottom:'18px'
              }}>
                {[
                  ['Total del servicio', `$${Number(modalPago.precio_total||0).toLocaleString('es-CO')}`],
                  ['Abono recibido',     `$${Number(modalPago.abono||0).toLocaleString('es-CO')}`],
                  ['Saldo pendiente',    `$${Math.max(0, Number(modalPago.precio_total||0) - Number(modalPago.abono||0)).toLocaleString('es-CO')}`],
                ].map(([l, v], i) => (
                  <div key={l} style={{
                    display:'flex', justifyContent:'space-between',
                    padding:'6px 0',
                    borderBottom: i < 2 ? '1px solid var(--bdr)' : 'none',
                    fontWeight: i === 2 ? '700' : '400',
                    color: i === 2 ? 'var(--pri)' : 'var(--tx)',
                    fontSize: i === 2 ? '15px' : '13px',
                  }}>
                    <span style={{ color: i === 2 ? 'var(--pri)' : 'var(--tx2)', fontWeight: i === 2 ? '600' : '400' }}>{l}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>

              {/* Si hay saldo pendiente, pedir cuánto pagó */}
              {Math.max(0, Number(modalPago.precio_total||0) - Number(modalPago.abono||0)) > 0 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Pago recibido ahora</label>
                    <input className="form-input" type="number"
                      placeholder={`Hasta $${Math.max(0, Number(modalPago.precio_total||0) - Number(modalPago.abono||0)).toLocaleString('es-CO')}`}
                      value={pagoRestante}
                      onChange={e => setPagoRestante(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Método de pago</label>
                    <div className="payment-pills">
                      {[['efectivo','Efectivo'],['transferencia','Transferencia'],['tarjeta','Tarjeta']].map(([v,l]) => (
                        <span key={v} className={`pill ${metodoPago===v?'active':''}`}
                          onClick={() => setMetodoPago(v)}>{l}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setModalPago(null)}>
                  Cancelar
                </button>
                <button className="btn-save" onClick={completarCita} disabled={updatingAppt}>
                  {updatingAppt ? 'Guardando...' : 'Confirmar y completar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`toast ${toastShow ? 'show' : ''}`}>{toast}</div>
    </motion.div>
  );
}

// ── VISTA INICIO ────────────────────────────────────────────────
function InicioView({
  todayAppts, appointments, loadingAppts,
  proximaCita, onApptClick, onCompletarClick
}) {
  const horasOcupadas = todayAppts.reduce((acc, a) => {
    if (!a.fecha_inicio || !a.fecha_fin) return acc;
    return acc + (new Date(a.fecha_fin) - new Date(a.fecha_inicio)) / 3600000;
  }, 0);

  const statCards = [
    {
      label: 'Citas hoy', icon: 'calendar', color: 'green',
      value: todayAppts.filter(a => a.estado !== 'cancelada').length,
      sub:   'programadas',
    },
    {
      label: 'Horas ocupadas', icon: 'clock', color: 'gold',
      value: `${horasOcupadas.toFixed(1)}h`,
      sub:   'del día',
    },
    {
      label: 'Pendientes', icon: 'users', color: 'purple',
      value: todayAppts.filter(a => a.estado === 'pendiente').length,
      sub:   'por confirmar',
    },
    {
      label: 'Próxima cita', icon: 'bell', color: 'blue',
      value: proximaCita
        ? new Date(proximaCita.fecha_inicio).toLocaleTimeString('es-CO', {
            hour:'2-digit', minute:'2-digit'
          })
        : '—',
      sub: proximaCita?.client?.nombre || 'Sin citas pendientes',
    },
  ];

  return (
    <>
      <div className="section-header">
        <div>
          <div className="section-title">Bienvenida</div>
          <div className="section-sub">Resumen de tu día</div>
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
          <div style={{ marginBottom:'16px', display:'flex',
            alignItems:'center', justifyContent:'space-between' }}>
            <div className="section-title" style={{ fontSize:'15px' }}>
              Timeline del día
            </div>
            {loadingAppts && (
              <span style={{ fontSize:'12px', color:'var(--tx2)' }}>
                Actualizando...
              </span>
            )}
          </div>

          {todayAppts.length === 0 && (
            <div style={{
              textAlign:'center', padding:'32px',
              color:'var(--tx2)', fontSize:'13px'
            }}>
              Sin citas programadas para hoy
            </div>
          )}

          <div className="timeline">
            {todayAppts.map((a, i) => (
              <div key={a.id || i} className="timeline-item">
                <div className="timeline-dot"
                  style={{ background: STATUS_COLOR[a.estado] || 'var(--pri)' }}>
                  {i + 1}
                </div>
                <div className="timeline-body" onClick={() => onApptClick(a)}>
                  <div className="timeline-time">
                    {new Date(a.fecha_inicio).toLocaleTimeString('es-CO', {
                      hour:'2-digit', minute:'2-digit'
                    })}
                    {a.fecha_fin && ` — ${new Date(a.fecha_fin).toLocaleTimeString('es-CO', {
                      hour:'2-digit', minute:'2-digit'
                    })}`}
                  </div>
                  <div className="timeline-client">
                    {a.client?.nombre || 'Cliente'}
                  </div>
                  <div className="timeline-service">
                    {a.service?.nombre || 'Servicio'}
                  </div>
                  <div style={{ display:'flex', alignItems:'center',
                    justifyContent:'space-between', marginTop:'6px' }}>
                    <span className={`status-badge ${STATUS_CLASS[a.estado] || 'pend'}`}
                      style={{ fontSize:'10px' }}>
                      {STATUS_LABEL[a.estado]}
                    </span>
                    {(a.estado === 'pendiente' || a.estado === 'confirmada') && (
                      <button
                        onClick={e => { e.stopPropagation(); onCompletarClick(a); }}
                        style={{
                          padding:'3px 10px', borderRadius:'6px',
                          border:'1px solid var(--pri)', background:'var(--pri-lt)',
                          color:'var(--pri)', fontSize:'10px', fontWeight:'600',
                          cursor:'pointer', fontFamily:'Inter,sans-serif'
                        }}>
                        Completar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <div className="right-card">
            <div className="right-card-title">Próximos clientes</div>
            {todayAppts.filter(a => a.estado !== 'cancelada').slice(0, 5).map((a, i) => (
              <div key={a.id || i} className="next-client-item">
                <div className="mini-avatar">
                  {(a.client?.nombre || 'C').split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div className="next-client-name" style={{ flex:1 }}>
                  {a.client?.nombre?.split(' ')[0] || 'Cliente'}
                </div>
                <div className="next-client-time">
                  {new Date(a.fecha_inicio).toLocaleTimeString('es-CO', {
                    hour:'2-digit', minute:'2-digit'
                  })}
                </div>
              </div>
            ))}
            {todayAppts.filter(a => a.estado !== 'cancelada').length === 0 && (
              <div style={{ fontSize:'12px', color:'var(--tx2)', padding:'8px 0' }}>
                Sin clientes para hoy
              </div>
            )}
          </div>

          <div className="right-card">
            <div className="right-card-title">Resumen general</div>
            {[
              {
                text: `${appointments.filter(a => a.estado === 'completada').length} citas completadas`,
                color: 'var(--pri)'
              },
              {
                text: `${appointments.filter(a => a.en_lista_espera).length} en lista de espera`,
                color: 'var(--acc)'
              },
              {
                text: `${appointments.filter(a => a.estado === 'cancelada').length} canceladas`,
                color: 'var(--err)'
              },
            ].map((r, i) => (
              <div key={i} className="reminder-item">
                <div className="reminder-dot" style={{ background: r.color }}></div>
                <div className="reminder-text">{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── VISTA AGENDA ────────────────────────────────────────────────
function AgendaView({
  appointments, loadingAppts, agendaTab, setAgendaTab,
  weekDays, hourSlots, onApptClick, showToast
}) {
  // Busca citas en un slot específico
  const getApptInSlot = (dayIndex, slotTime) => {
    const dayDate = weekDays[dayIndex];
    if (!dayDate) return [];
    const slotH = parseInt(slotTime.split(':')[0]);
    const slotM = parseInt(slotTime.split(':')[1]);
    return appointments.filter(a => {
      if (!a.fecha_inicio) return false;
      const f = new Date(a.fecha_inicio);
      return (
        f.getDate()     === dayDate.getDate()     &&
        f.getMonth()    === dayDate.getMonth()    &&
        f.getFullYear() === dayDate.getFullYear() &&
        f.getHours()    === slotH                 &&
        Math.floor(f.getMinutes() / 30) * 30 === Math.floor(slotM / 30) * 30 &&
        a.estado !== 'cancelada'
      );
    });
  };

  const semanaLabel = weekDays.length > 0
    ? `${weekDays[0].toLocaleDateString('es-CO',{day:'2-digit',month:'short'})} – ${weekDays[6].toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})}`
    : '';

  return (
    <>
      <div className="agenda-header">
        <div className="section-title">Mi Agenda</div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div className="week-nav">
            <button className="week-nav-btn">&#8249;</button>
            <div className="week-label">{semanaLabel}</div>
            <button className="week-nav-btn">&#8250;</button>
          </div>
          <div className="filter-tabs">
            {['hoy','semana','mes'].map(t => (
              <button key={t}
                className={`filter-tab ${agendaTab===t?'active':''}`}
                onClick={() => setAgendaTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loadingAppts && (
        <div style={{ textAlign:'center', padding:'40px',
          color:'var(--tx2)', fontSize:'13px' }}>
          Cargando agenda...
        </div>
      )}

      {!loadingAppts && (
        <div className="cal-grid" style={{ display:'grid',
          gridTemplateColumns:'64px repeat(7,1fr)' }}>

          {/* Headers */}
          <div style={{ background:'var(--bg2)', padding:'10px',
            borderBottom:'1px solid var(--bdr)', borderRight:'1px solid var(--bdr)' }}>
          </div>
          {weekDays.map((d, i) => {
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={`cal-head-cell ${isToday?'today':''}`}>
                <div style={{ fontSize:'11px', color:'var(--tx2)' }}>
                  {DAY_LABELS[i]}
                </div>
                <span style={{
                  display:'flex', alignItems:'center', justifyContent:'center',
                  width: isToday ? '32px' : 'auto',
                  height: isToday ? '32px' : 'auto',
                  borderRadius: isToday ? '50%' : '0',
                  background: isToday ? 'var(--pri)' : 'transparent',
                  color: isToday ? '#fff' : 'var(--tx)',
                  fontSize:'18px', fontWeight:'700', margin:'2px auto 0'
                }}>
                  {d.getDate()}
                </span>
              </div>
            );
          })}

          {/* Slots */}
          {hourSlots.map(slot => (
            <React.Fragment key={slot}>
              <div className="cal-time-cell">{slot}</div>
              {weekDays.map((_, di) => {
                const appts = getApptInSlot(di, slot);
                return (
                  <div key={di} className="cal-cell"
                    style={{ position:'relative', minHeight:'52px' }}>
                    {appts.length > 0 && (
                      <div style={{
                        position:'absolute', inset:'2px',
                        display:'flex', gap:'2px'
                      }}>
                        {appts.map((a, ai) => (
                          <div key={a.id || ai}
                            onClick={() => onApptClick(a)}
                            className="cal-appt"
                            style={{
                              flex:1, minWidth:0, cursor:'pointer',
                              background:`${STATUS_COLOR[a.estado]||'#4A7C59'}18`,
                              borderLeft:`3px solid ${STATUS_COLOR[a.estado]||'#4A7C59'}`,
                            }}>
                            <div className="cal-appt-client"
                              style={{ color: STATUS_COLOR[a.estado]||'var(--pri)' }}>
                              {a.client?.nombre?.split(' ')[0] || 'Cliente'}
                            </div>
                            <div className="cal-appt-service">
                              {a.service?.nombre || ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Lista de citas de esta semana */}
      {!loadingAppts && appointments.length === 0 && (
        <div style={{
          textAlign:'center', padding:'48px',
          color:'var(--tx2)', fontSize:'13px',
          background:'var(--bg3)', borderRadius:'12px',
          border:'1px solid var(--bdr)', marginTop:'16px'
        }}>
          No hay citas registradas esta semana
        </div>
      )}
    </>
  );
}

// ── VISTA DISPONIBILIDAD ────────────────────────────────────────
function DisponibilidadView({ days, setDays, blocked, setBlocked, showToast }) {
  const toggleDay = (i) => {
    const updated = [...days];
    updated[i] = { ...updated[i], on: !updated[i].on };
    setDays(updated);
  };

  const removeBlocked = (id) => {
    setBlocked(prev => prev.filter(b => b.id !== id));
    showToast('Bloqueo eliminado');
  };

  return (
    <>
      <div className="section-header" style={{ marginBottom:'20px' }}>
        <div>
          <div className="section-title">Disponibilidad</div>
          <div className="section-sub">Configura tus horarios y bloqueos</div>
        </div>
        <button className="save-btn"
          onClick={() => showToast('Horarios guardados')}>
          Guardar cambios
        </button>
      </div>

      <div className="avail-section">
        <div className="avail-title">Mis días de atención</div>
        {days.map((d, i) => (
          <div key={d.key} className="day-row">
            <div className="day-name">{d.label}</div>
            <button className={`toggle ${d.on?'on':'off'}`}
              onClick={() => toggleDay(i)}>
              <div className="toggle-dot"></div>
            </button>
            {d.on ? (
              <div className="time-pair">
                <input className="time-input" type="time" defaultValue={d.open} />
                <span className="time-sep">→</span>
                <input className="time-input" type="time" defaultValue={d.close} />
              </div>
            ) : (
              <span className="day-inactive">No disponible</span>
            )}
          </div>
        ))}
      </div>

      <div className="avail-section">
        <div className="avail-title">Bloquear horario</div>
        <div className="form-row" style={{ marginBottom:'10px' }}>
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input className="form-input" type="date"
              min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group">
            <label className="form-label">Motivo</label>
            <input className="form-input" type="text"
              placeholder="Ej: Descanso, Capacitación" />
          </div>
        </div>
        <div className="form-row" style={{ marginBottom:'14px' }}>
          <div className="form-group">
            <label className="form-label">Hora inicio</label>
            <input className="form-input" type="time" />
          </div>
          <div className="form-group">
            <label className="form-label">Hora fin</label>
            <input className="form-input" type="time" />
          </div>
        </div>
        <button className="save-btn"
          onClick={() => showToast('Bloqueo agregado')}>
          Agregar bloqueo
        </button>

        {blocked.length > 0 && (
          <div style={{ marginTop:'16px' }}>
            <div className="blocked-list">
              {blocked.map(b => (
                <div key={b.id} className="blocked-chip">
                  {b.label}
                  <span className="blocked-chip-remove"
                    onClick={() => removeBlocked(b.id)}>✕</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── VISTA CLIENTES DEL DÍA ──────────────────────────────────────
function ClientesView({ appointments, search, setSearch, onApptClick, loadingAppts }) {
  return (
    <>
      <div className="section-header" style={{ marginBottom:'20px' }}>
        <div>
          <div className="section-title">Clientes del día</div>
          <div className="section-sub">
            {appointments.length} cliente(s) encontrado(s)
          </div>
        </div>
      </div>

      <div className="clients-search">
        <span className="clients-search-icon">
          <svg width="14" height="14" fill="none" stroke="currentColor"
            strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input type="text" placeholder="Buscar cliente..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loadingAppts && (
        <div style={{ textAlign:'center', padding:'40px',
          color:'var(--tx2)', fontSize:'13px' }}>
          Cargando clientes...
        </div>
      )}

      {!loadingAppts && (
        <div className="clients-table-wrap">
          <table className="clients-table">
            <thead><tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Notas</th>
            </tr></thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="5" style={{
                  textAlign:'center', padding:'32px',
                  color:'var(--tx2)', fontSize:'13px'
                }}>
                  Sin clientes para mostrar
                </td></tr>
              ) : appointments.map((a, i) => (
                <tr key={a.id||i} onClick={() => onApptClick(a)}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div className="mini-avatar">
                        {(a.client?.nombre||'C').split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <strong>{a.client?.nombre||'—'}</strong>
                    </div>
                  </td>
                  <td>{a.service?.nombre||'—'}</td>
                  <td style={{ fontWeight:'500' }}>
                    {new Date(a.fecha_inicio).toLocaleTimeString('es-CO',{
                      hour:'2-digit', minute:'2-digit'
                    })}
                  </td>
                  <td>
                    <span className={`status-badge ${STATUS_CLASS[a.estado]||'pend'}`}>
                      {STATUS_LABEL[a.estado]||a.estado}
                    </span>
                  </td>
                  <td style={{ color:'var(--tx2)' }}>
                    {a.notas||'—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── VISTA PERFIL ────────────────────────────────────────────────
function PerfilView({
  professional, user, notifWa, setNotifWa,
  notifEmail, setNotifEmail, showToast
}) {
  return (
    <>
      <div className="section-header" style={{ marginBottom:'24px' }}>
        <div>
          <div className="section-title">Mi Perfil</div>
          <div className="section-sub">Tu información profesional</div>
        </div>
        <button className="save-btn"
          onClick={() => showToast('Cambios guardados')}>
          Guardar cambios
        </button>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {(professional?.nombre||user?.nombre||'PR')
                .split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div className="profile-avatar-info">
              <h3>{professional?.nombre||user?.nombre||'Profesional'}</h3>
              <p>{professional?.especialidad||'Especialista'}</p>
            </div>
            <button className="profile-change-photo"
              onClick={() => showToast('Selector de imagen próximamente')}>
              Cambiar foto
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input className="form-input" type="text"
                defaultValue={professional?.nombre||user?.nombre||''} />
            </div>
            <div className="form-group">
              <label className="form-label">Especialidad</label>
              <input className="form-input" type="text"
                defaultValue={professional?.especialidad||''} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" type="tel"
                defaultValue={professional?.telefono||''} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email"
                defaultValue={professional?.email||user?.email||''} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción profesional</label>
            <textarea className="form-input" rows="3"
              style={{ resize:'none' }}
              defaultValue={professional?.descripcion||''} />
          </div>
        </div>

        <div className="config-card">
          <div className="config-title">Notificaciones</div>
          {[
            { label:'WhatsApp', sub:'Recordatorios por WhatsApp', val:notifWa, set:setNotifWa },
            { label:'Email',    sub:'Notificaciones por correo',  val:notifEmail, set:setNotifEmail },
          ].map((item, i) => (
            <div key={i} className="config-item">
              <div>
                <div className="config-item-label">{item.label}</div>
                <div className="config-item-sub">{item.sub}</div>
              </div>
              <button className={`toggle ${item.val?'on':'off'}`}
                onClick={() => {
                  item.set(!item.val);
                  showToast(`Notif. ${item.label} ${!item.val?'activadas':'desactivadas'}`);
                }}>
                <div className="toggle-dot"></div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── ICONOS ──────────────────────────────────────────────────────
function NavIcon({ name }) {
  const icons = {
    inicio: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    agenda: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    disponibilidad: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
    clientes: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    perfil: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };
  return icons[name] || null;
}

function StatIcon({ name }) {
  const icons = {
    calendar: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
    users:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    bell:     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  };
  return icons[name] || null;
}