import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/admin-dashboard.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  servicesAPI, professionalsAPI, clientsAPI,
  appointmentsAPI, settingsAPI, authAPI
} from '../services/api';

// Componentes modulares
import AgendaView  from '../components/admin/AgendaView';
import GestionView from '../components/admin/GestionView';

// ── Generador de slots ──────────────────────────────────────────
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

const PROF_COLORS = ['#8B5CF6','#EC4899','#06B6D4','#10B981','#F59E0B','#EF4444'];

export default function AdminDashboard() {

  // ── Datos API ───────────────────────────────────────────────
  const [professionals, setProfessionals] = useState([]);
  const [services,      setServices]      = useState([]);
  const [clients,       setClients]       = useState([]);
  const [appointments,  setAppointments]  = useState([]);
  const [businessConfig, setBusinessConfig] = useState({
    apertura: '09:00', cierre: '19:00',
    slot_duration: 60, abono_minimo: 50, min_advance_hours: 2
  });

  // ── Loading ─────────────────────────────────────────────────
  const [loadingProfs,    setLoadingProfs]    = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingAppts,    setLoadingAppts]    = useState(false);
  const [loadingClients,  setLoadingClients]  = useState(false);

  // ── Navegación ──────────────────────────────────────────────
  const [currentView, setCurrentView] = useState('agenda');
  const [calView,     setCalView]     = useState('cal');
  const [gestionTab,  setGestionTab]  = useState('profesionales');
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [panelTab,    setPanelTab]    = useState('empresa');
  const [modalOpen,   setModalOpen]   = useState(false);

  // ── Modal nueva cita ────────────────────────────────────────
  const [mClientId,     setMClientId]     = useState(null);
  const [mClientSearch, setMClientSearch] = useState('');
  const [mClientDrop,   setMClientDrop]   = useState([]);
  const [showDrop,      setShowDrop]      = useState(false);
  const [mProfId,       setMProfId]       = useState('');
  const [mSvcId,        setMSvcId]        = useState('');
  const [mFecha,        setMFecha]        = useState(new Date().toISOString().split('T')[0]);
  const [mHoraInicio,   setMHoraInicio]   = useState('09:00');
  const [mHoraFin,      setMHoraFin]      = useState('10:00');
  const [mTotal,        setMTotal]        = useState(0);
  const [mAbono,        setMAbono]        = useState('');
  const [mPayMethod,    setMPayMethod]    = useState('efectivo');
  const clientDropRef = useRef(null);

  // ── Toast ───────────────────────────────────────────────────
  const [toast,     setToast]     = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2800);
  }, []);

  // ── Slots dinámicos desde businessConfig ─────────────────────
  const hourSlots = generateHourSlots(
    businessConfig.apertura,
    businessConfig.cierre,
    businessConfig.slot_duration
  );

  // ── Cargar configuración ─────────────────────────────────────
  useEffect(() => {
    settingsAPI.getBusiness()
      .then(res => setBusinessConfig({
        apertura:          res.data.opening_time,
        cierre:            res.data.closing_time,
        slot_duration:     res.data.slot_duration,
        abono_minimo:      parseFloat(res.data.minimum_deposit_percent),
        min_advance_hours: res.data.min_advance_hours,
      }))
      .catch(() => {});
  }, []);

  // ── Cargar profesionales ──────────────────────────────────────
  useEffect(() => {
    setLoadingProfs(true);
    professionalsAPI.getAdmin()
      .then(res => {
        const formatted = res.data.map((p, i) => ({
          ...p, on: p.activo !== false,
          color: PROF_COLORS[i % PROF_COLORS.length]
        }));
        setProfessionals(formatted);
      })
      .catch(() => showToast('Error cargando profesionales'))
      .finally(() => setLoadingProfs(false));
  }, []);

  // ── Cargar servicios ──────────────────────────────────────────
  useEffect(() => {
    setLoadingServices(true);
    servicesAPI.getAdmin()
      .then(res => setServices(res.data))
      .catch(() => showToast('Error cargando servicios'))
      .finally(() => setLoadingServices(false));
  }, []);

  // ── Cargar citas ──────────────────────────────────────────────
  const fetchAppointments = useCallback(() => {
    setLoadingAppts(true);
    appointmentsAPI.getAll()
      .then(res => setAppointments(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingAppts(false));
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ── Cargar clientes cuando se abre panel ──────────────────────
  useEffect(() => {
    if (panelOpen && panelTab === 'clientes') {
      setLoadingClients(true);
      clientsAPI.getAll()
        .then(res => setClients(res.data))
        .catch(() => showToast('Error cargando clientes'))
        .finally(() => setLoadingClients(false));
    }
  }, [panelOpen, panelTab]);

  // ── Autocomplete clientes en modal ───────────────────────────
  useEffect(() => {
    if (mClientSearch.length < 1) { setMClientDrop([]); return; }
    // Cargar si vacío
    const source = clients.length > 0
      ? Promise.resolve({ data: clients })
      : clientsAPI.getAll().then(r => { setClients(r.data); return r; });

    source.then(r => {
      const filtered = r.data.filter(c =>
        c.nombre.toLowerCase().includes(mClientSearch.toLowerCase()) ||
        (c.telefono || '').includes(mClientSearch)
      );
      setMClientDrop(filtered.slice(0, 6));
      setShowDrop(filtered.length > 0);
    }).catch(() => {});
  }, [mClientSearch, clients]);

  // ── Cerrar dropdown al clic fuera ────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (clientDropRef.current && !clientDropRef.current.contains(e.target))
        setShowDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Autocálculo hora fin ──────────────────────────────────────
  useEffect(() => {
    if (!mSvcId || !mHoraInicio) return;
    const svc = services.find(s => s.id === parseInt(mSvcId));
    if (!svc) return;
    const [h, m] = mHoraInicio.split(':').map(Number);
    const total = h * 60 + m + svc.duracion;
    setMHoraFin(
      `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
    );
  }, [mSvcId, mHoraInicio, services]);

  // ── Click en slot → abrir modal con fecha y hora exactas ─────
  const handleSlotClick = useCallback(({ fecha, hora }) => {
    setMFecha(fecha);
    setMHoraInicio(hora);
    setMClientId(null);
    setMClientSearch('');
    setMSvcId('');
    setMAbono('');
    setMTotal(0);
    setModalOpen(true);
  }, []);

  // ── Guardar cita ──────────────────────────────────────────────
  const pctAbono = parseFloat(businessConfig.abono_minimo) || 50;
  const saldo    = Math.max(0, mTotal - (parseFloat(mAbono) || 0));

  const saveAppt = async () => {
    if (!mClientId)   { showToast('Selecciona un cliente'); return; }
    if (!mProfId)     { showToast('Selecciona un profesional'); return; }
    if (!mSvcId)      { showToast('Selecciona un servicio'); return; }

    const abonoNum = parseFloat(mAbono) || 0;
    const pct = parseFloat(businessConfig?.abono_minimo) || 50;
    const minAbono = mTotal * (pctAbono / 100);

    if (mTotal > 0 && abonoNum < minAbono) {
      showToast(`Abono mínimo: ${pctAbono}% = $${minAbono.toLocaleString('es-CO')}`);
      return;
    }

    try {
      const avail = await appointmentsAPI.checkAvailability(
        parseInt(mProfId),
        `${mFecha}T${mHoraInicio}:00`,
        `${mFecha}T${mHoraFin}:00`
      );
      if (!avail.data.disponible) {
        showToast('El profesional no está disponible en ese horario'); return;
      }

      await appointmentsAPI.create({
        client_id:       mClientId,
        professional_id: parseInt(mProfId),
        service_id:      parseInt(mSvcId),
        fecha_inicio:    `${mFecha}T${mHoraInicio}:00`,
        fecha_fin:       `${mFecha}T${mHoraFin}:00`,
        precio_total:    mTotal,
        abono:           abonoNum,
        metodo_pago:     mPayMethod,
        en_lista_espera: false,
      });

      fetchAppointments();
      setModalOpen(false);
      setMClientId(null); setMClientSearch(''); setMSvcId('');
      setMAbono(''); setMTotal(0);
      showToast('Cita guardada exitosamente');
    } catch (err) {
      showToast(err.userMessage || 'Error al guardar la cita');
    }
  };

  const cancelAppt = useCallback((id) => {
    appointmentsAPI.cancel(id)
      .then(() => { fetchAppointments(); showToast('Cita cancelada'); })
      .catch(err => showToast(err.userMessage || 'Error al cancelar'));
  }, [fetchAppointments]);

  const todayCount = appointments.filter(a => {
    const f = new Date(a.fecha_inicio);
    const t = new Date();
    return f.toDateString() === t.toDateString() && a.estado !== 'cancelada';
  }).length;

  return (
    <motion.div className="app"
      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:.3 }}>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
          </div>
          <div className="nav-logo-text">Entre<span>Manos</span></div>
        </div>

        <div className="nav-tabs">
          {['agenda','ventas','gestion'].map(v => (
            <button key={v}
              className={`nav-tab ${currentView===v?'active':''}`}
              onClick={() => setCurrentView(v)}>
              {v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>

        <div className="nav-right">
          <button className="notif-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor"
              strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {todayCount > 0 && (
              <span className="notif-badge">{todayCount}</span>
            )}
          </button>
          <button className="avatar-btn" onClick={() => setPanelOpen(!panelOpen)}>KG</button>
        </div>
      </nav>

      {/* MAIN */}
      <div className="main">

        {/* SIDEBAR — selector de profesional tipo pill */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Profesionales</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px', marginTop:'8px' }}>
              {professionals.filter(p => p.activo !== false).map((p, i) => (
                <button key={p.id}
                  style={{
                    padding:'8px 10px', borderRadius:'8px', border:'none',
                    background:'transparent', color:'var(--tx2)',
                    fontSize:'12px', cursor:'pointer', textAlign:'left',
                    fontFamily:'Inter,sans-serif', transition:'all .15s',
                    borderLeft:`3px solid ${p.color || 'transparent'}`,
                    display:'flex', alignItems:'center', gap:'8px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{
                    width:'8px', height:'8px', borderRadius:'50%',
                    background: p.color || 'var(--pri)', flexShrink:0
                  }} />
                  {p.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Hoy</div>
            <div className="quick-stats">
              <div>Citas: <strong>{todayCount}</strong></div>
              <div>Pendientes: <strong className="color-gold">
                {appointments.filter(a => a.estado==='pendiente').length}
              </strong></div>
              <div>Confirmadas: <strong className="color-green">
                {appointments.filter(a => a.estado==='confirmada').length}
              </strong></div>
            </div>
          </div>
        </aside>

        {/* CONTENIDO */}
        <motion.main className="content" key={currentView}
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:.25 }}>

          {currentView === 'agenda' && (
            <AgendaView
              professionals={professionals}
              appointments={appointments}
              hourSlots={hourSlots}
              calView={calView}
              setCalView={setCalView}
              onSlotClick={(slotData) => {
                setMFecha(slotData.fecha);
                setMHoraInicio(slotData.hora);
                setModalOpen(true);
              }}
              onApptClick={(appt) => {
                console.log(appt);
              }}
              onCancel={cancelAppt}
              loadingAppts={loadingAppts}
              services={services}
            />
          )}

          {currentView === 'ventas' && (
            <VentasView appointments={appointments} />
          )}

          {currentView === 'gestion' && (
            <GestionView
              professionals={professionals}
              setProfessionals={setProfessionals}
              services={services}
              setServices={setServices}
              loadingProfs={loadingProfs}
              loadingServices={loadingServices}
              gestionTab={gestionTab}
              setGestionTab={setGestionTab}
              showToast={showToast}
              businessConfig={businessConfig}
              setBusinessConfig={setBusinessConfig}
            />
          )}
        </motion.main>
      </div>

      {/* MODAL NUEVA CITA */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="modal-overlay open"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => e.target===e.currentTarget && setModalOpen(false)}>
            <motion.div className="modal"
              initial={{ opacity:0, scale:.93, y:16 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:.93, y:16 }}>

              <div className="modal-header">
                <div className="modal-title">Nueva cita</div>
                <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
              </div>

              {/* Cliente autocomplete */}
              <div className="form-group" ref={clientDropRef} style={{ position:'relative' }}>
                <label className="form-label">Cliente</label>
                <input className="form-input" type="text" autoComplete="off"
                  placeholder="Buscar por nombre o teléfono..."
                  value={mClientSearch}
                  onChange={e => {
                    setMClientSearch(e.target.value);
                    setMClientId(null);
                  }}
                  onFocus={() => mClientDrop.length > 0 && setShowDrop(true)}
                />
                {mClientId && (
                  <div style={{ fontSize:'11px', color:'var(--pri)', marginTop:'4px', fontWeight:'500' }}>
                    ✓ {mClientSearch}
                  </div>
                )}
                {showDrop && mClientDrop.length > 0 && (
                  <div style={{
                    position:'absolute', top:'100%', left:0, right:0, zIndex:999,
                    background:'#fff', border:'1px solid var(--bdr)',
                    borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,.1)',
                    overflow:'hidden', marginTop:'4px'
                  }}>
                    {mClientDrop.map(c => (
                      <div key={c.id}
                        style={{ padding:'10px 14px', cursor:'pointer',
                          fontSize:'13px', borderBottom:'1px solid var(--bdr)',
                          transition:'background .1s' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--pri-lt)'}
                        onMouseLeave={e => e.currentTarget.style.background='#fff'}
                        onClick={() => {
                          setMClientId(c.id);
                          setMClientSearch(c.nombre);
                          setShowDrop(false);
                        }}>
                        <div style={{ fontWeight:'500', color:'var(--tx)' }}>{c.nombre}</div>
                        <div style={{ fontSize:'11px', color:'var(--tx2)' }}>
                          {c.telefono || 'Sin teléfono'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input className="form-input" type="date"
                    value={mFecha} onChange={e => setMFecha(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Profesional</label>
                  <select className="form-input form-select"
                    value={mProfId} onChange={e => setMProfId(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {professionals.filter(p => p.activo !== false).map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Servicio</label>
                <select className="form-input form-select"
                  value={mSvcId}
                  onChange={e => {
                    setMSvcId(e.target.value);
                    const s = services.find(x => x.id === parseInt(e.target.value));
                    if (s) setMTotal(parseFloat(s.precio));
                  }}>
                  <option value="">Seleccionar servicio...</option>
                  {services.filter(s => s.activo !== false).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} — {s.duracion} min — ${Number(s.precio).toLocaleString('es-CO')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hora inicio</label>
                  <input className="form-input" type="time"
                    value={mHoraInicio} onChange={e => setMHoraInicio(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Hora fin
                    {mSvcId && <span style={{ fontSize:'10px', color:'var(--acc)', marginLeft:'6px' }}>
                      (automática)
                    </span>}
                  </label>
                  <input className="form-input" type="time"
                    value={mHoraFin} onChange={e => setMHoraFin(e.target.value)} />
                </div>
              </div>

              {/* Banner duración */}
              {mSvcId && mHoraInicio && mHoraFin && (
                <div style={{
                  background:'var(--pri-lt)', border:'1px solid var(--pri)',
                  borderRadius:'8px', padding:'8px 12px', fontSize:'12px',
                  color:'var(--pri)', marginBottom:'8px', fontWeight:'500'
                }}>
                  Llegada: {mHoraInicio} → Salida: {mHoraFin}
                  {` (${services.find(s => s.id===parseInt(mSvcId))?.duracion||0} min)`}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total</label>
                  <input className="form-input" type="text" readOnly
                    style={{ background:'var(--bg2)' }}
                    value={mTotal ? `$${Number(mTotal).toLocaleString('es-CO')}` : ''} />
                </div>
                <div className="form-group">
                    <label className="form-label">
                      Abono (mín {parseFloat(businessConfig?.abono_minimo) || 50}%)
                    </label>
                  <input className="form-input" type="number" placeholder="$0"
                    value={mAbono} onChange={e => setMAbono(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Método de pago</label>
                <div className="payment-pills">
                  {[['efectivo','Efectivo'],['transferencia','Transferencia'],['tarjeta','Tarjeta']].map(([v,l]) => (
                    <span key={v} className={`pill ${mPayMethod===v?'active':''}`}
                      onClick={() => setMPayMethod(v)}>{l}</span>
                  ))}
                </div>
              </div>

              <div className="total-row">
                <span className="total-label">Saldo pendiente:</span>
                <span className="total-val">${saldo.toLocaleString('es-CO')}</span>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button className="btn-save" onClick={saveAppt}>Guardar cita</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PANEL LATERAL */}
      <motion.div className="side-panel"
        animate={{ x: panelOpen ? 0 : '100%' }}
        initial={{ x: '100%' }}
        transition={{ type:'spring', stiffness:300, damping:30 }}>

        <div className="side-panel-header">
          <div className="side-panel-title">Mi cuenta</div>
          <button className="modal-close" onClick={() => setPanelOpen(false)}>✕</button>
        </div>

        <div className="panel-tabs">
          {[['empresa','Mi empresa'],['clientes','Clientes'],['config','Config.']].map(([k,l]) => (
            <button key={k} className={`panel-tab ${panelTab===k?'active':''}`}
              onClick={() => setPanelTab(k)}>{l}</button>
          ))}
        </div>

        {panelTab === 'empresa' && (
          <div className="panel-section">
            <div className="panel-form-group" style={{ marginTop:'8px' }}>
              <label className="panel-label">Nombre del negocio</label>
              <input className="panel-input" type="text" defaultValue="Entre Manos" />
            </div>
            <div className="panel-form-group">
              <label className="panel-label">Instagram</label>
              <input className="panel-input" type="text" placeholder="@entremanos" />
            </div>
            <div className="panel-form-group">
              <label className="panel-label">WhatsApp</label>
              <input className="panel-input" type="text" placeholder="+57 300 000 0000" />
            </div>
            <button className="save-btn" onClick={() => showToast('Guardado')}>
              Guardar
            </button>
            <div className="logout-row"
              onClick={() => { localStorage.removeItem('token'); window.location.href='/login'; }}>
              Cerrar sesión
            </div>
          </div>
        )}

        {panelTab === 'clientes' && (
          <div className="panel-section">
            <input className="panel-input" type="text"
              placeholder="Buscar cliente..."
              style={{ marginBottom:'14px' }}
              onChange={e => {
                if (e.target.value.length >= 2)
                  clientsAPI.search(e.target.value).then(r => setClients(r.data)).catch(() => {});
                else if (!e.target.value)
                  clientsAPI.getAll().then(r => setClients(r.data)).catch(() => {});
              }}
            />
            {loadingClients && (
              <div style={{ textAlign:'center', padding:'16px',
                color:'var(--tx2)', fontSize:'13px' }}>
                Cargando...
              </div>
            )}
            {!loadingClients && clients.filter(c => c.activo && !c.bloqueado).map(c => (
              <div key={c.id} className="client-item">
                <div className="client-avatar">
                  {c.nombre.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div className="client-info">
                  <div className="client-name">{c.nombre}</div>
                  <div className="client-meta">
                    {c.telefono||'Sin teléfono'} · {c.email||'Sin email'}
                  </div>
                </div>
                <div className="client-actions">
                  <button className="client-action-btn block"
                    onClick={() => {
                      clientsAPI.block(c.id)
                        .then(() => {
                          showToast(`${c.nombre} bloqueado`);
                          setClients(prev => prev.map(x =>
                            x.id===c.id ? {...x, bloqueado:true, activo:false} : x
                          ));
                        })
                        .catch(() => showToast('Error al bloquear'));
                    }}>Bloquear</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {panelTab === 'config' && (
          <div className="panel-section">
            <div style={{ fontSize:'13px', color:'var(--tx2)', marginBottom:'12px' }}>
              Usa Gestión → Horarios para cambiar la configuración completa del negocio.
            </div>
            <button className="save-btn" onClick={() => setCurrentView('gestion')}>
              Ir a configuración
            </button>
          </div>
        )}
      </motion.div>

      <div className={`toast ${toastShow?'show':''}`}>{toast}</div>
    </motion.div>
  );
}

// ── VENTAS VIEW — datos reales ────────────────────────────────────
function VentasView({ appointments }) {
  const [periodo, setPeriodo] = useState('mes');
  const now = new Date();

  const filtered = appointments.filter(a => {
    const f = new Date(a.fecha_inicio);
    if (periodo==='hoy')    return f.toDateString()===now.toDateString();
    if (periodo==='semana') return (now-f)/(86400000) < 7 && f <= now;
    if (periodo==='mes')    return f.getMonth()===now.getMonth() && f.getFullYear()===now.getFullYear();
    if (periodo==='anio')   return f.getFullYear()===now.getFullYear();
    return true;
  });

  const ingresos  = filtered.reduce((s,a) => s+parseFloat(a.precio_total||0), 0);
  const abonos    = filtered.reduce((s,a) => s+parseFloat(a.abono||0), 0);
  const completadas = filtered.filter(a => a.estado==='completada'||a.estado==='confirmada');
  const canceladas  = filtered.filter(a => a.estado==='cancelada');

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const porMes = meses.map((_,mi) =>
    appointments
      .filter(a => new Date(a.fecha_inicio).getMonth()===mi &&
                   new Date(a.fecha_inicio).getFullYear()===now.getFullYear())
      .reduce((s,a) => s+parseFloat(a.precio_total||0), 0)
  );
  const maxV = Math.max(...porMes, 1);

  return (
    <>
      <div className="agenda-header">
        <div className="agenda-title">Ventas y reportes</div>
      </div>

      <div className="period-tabs">
        {[['hoy','Hoy'],['semana','Semana'],['mes','Mes'],['anio','Año']].map(([v,l]) => (
          <button key={v} className={`period-tab ${periodo===v?'active':''}`}
            onClick={() => setPeriodo(v)}>{l}</button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Ingresos totales</div>
          <div className="stat-value">${ingresos.toLocaleString('es-CO')}</div>
          <div className="stat-sub">{filtered.length} citas en el período</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completadas</div>
          <div className="stat-value">{completadas.length}</div>
          <div className="stat-sub">de {filtered.length} totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Abonos recibidos</div>
          <div className="stat-value">${abonos.toLocaleString('es-CO')}</div>
          <div className="stat-sub">
            {ingresos>0 ? Math.round(abonos/ingresos*100) : 0}% del total
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cancelaciones</div>
          <div className="stat-value">{canceladas.length}</div>
          <div className="stat-sub" style={{ color:'var(--err)' }}>
            {filtered.length>0 ? Math.round(canceladas.length/filtered.length*100) : 0}%
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-title">Ingresos {now.getFullYear()}</div>
        <div className="bar-chart">
          {porMes.map((v,i) => (
            <div key={i} className="bar-wrap">
              <div className="bar"
                style={{ height:`${Math.max((v/maxV)*100,2)}%`,
                  opacity:i===now.getMonth()?1:.5 }}
                title={`$${v.toLocaleString('es-CO')}`} />
              <div className="bar-label">{meses[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length > 0 && (
        <div style={{ background:'var(--bg3)', border:'1px solid var(--bdr)',
          borderRadius:'12px', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--bdr)',
            fontSize:'14px', fontWeight:'600' }}>
            Últimas transacciones
          </div>
          <table className="list-table">
            <thead><tr>
              <th>Fecha</th><th>Cliente</th><th>Servicio</th>
              <th>Total</th><th>Abono</th><th>Estado</th>
            </tr></thead>
            <tbody>
              {filtered.slice(0,10).map(a => (
                <tr key={a.id}>
                  <td>{new Date(a.fecha_inicio).toLocaleDateString('es-CO')}</td>
                  <td>{a.client?.nombre||'—'}</td>
                  <td>{a.service?.nombre||'—'}</td>
                  <td style={{ fontWeight:'600', color:'var(--pri)' }}>
                    ${Number(a.precio_total||0).toLocaleString('es-CO')}
                  </td>
                  <td>${Number(a.abono||0).toLocaleString('es-CO')}</td>
                  <td>
                    <span className={`status-badge ${
                      a.estado==='confirmada'?'conf':
                      a.estado==='pendiente'?'pend':'canc'}`}>
                      {a.estado.charAt(0).toUpperCase()+a.estado.slice(1)}
                    </span>
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