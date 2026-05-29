
import React, { useState } from 'react';
import '../styles/admin-dashboard.css';
import { motion, AnimatePresence } from 'framer-motion';

// ── DATOS ──────────────────────────────────────────────
const professionals = [
  { name: 'María García',  role: 'Esteticista',  color: '#4A7C59', on: true  },
  { name: 'Laura Torres',  role: 'Masajista',    color: '#C9A84C', on: true  },
  { name: 'Ana Martínez',  role: 'Manicurista',  color: '#7B5EA7', on: true  },
  { name: 'Sofia Reyes',   role: 'Cosmetóloga',  color: '#D94F4F', on: false },
];

const appointments = [
  { day:1, hour:9,  client:'Carolina Díaz',   service:'Facial',   prof:0, height:2   },
  { day:1, hour:11, client:'Valentina López', service:'Manicure', prof:2, height:1   },
  { day:2, hour:10, client:'Isabella Mora',   service:'Masaje',   prof:1, height:2   },
  { day:3, hour:14, client:'Camila Ruiz',     service:'Pedicure', prof:0, height:1.5 },
  { day:4, hour:9,  client:'Natalia Cruz',    service:'Facial',   prof:3, height:2   },
  { day:5, hour:11, client:'Daniela Parra',   service:'Cejas',    prof:2, height:1   },
];

const services = [
  { name:'Manicure completa',   price:'$80.000',  dur:'45 min', icon:'💅' },
  { name:'Facial hidratante',   price:'$120.000', dur:'60 min', icon:'✨' },
  { name:'Masaje relajante',    price:'$150.000', dur:'75 min', icon:'🌿' },
  { name:'Depilación cejas',    price:'$60.000',  dur:'30 min', icon:'🌸' },
  { name:'Pedicure spa',        price:'$200.000', dur:'90 min', icon:'🦋' },
  { name:'Tratamiento capilar', price:'$180.000', dur:'80 min', icon:'🌺' },
];

const clients = [
  { name:'Carolina Díaz',   phone:'310 xxx xxxx', visits:8  },
  { name:'Isabella Mora',   phone:'315 xxx xxxx', visits:4  },
  { name:'Valentina López', phone:'320 xxx xxxx', visits:12 },
  { name:'Camila Ruiz',     phone:'318 xxx xxxx', visits:2  },
];

const DAYS  = ['Lun','Mar','Mié','Jue','Vie','Sáb'];
const HOURS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];

// ── COMPONENTE PRINCIPAL ───────────────────────────────
export default function AdminDashboard() {

  const [currentView,  setCurrentView]  = useState('agenda');
  const [calView,      setCalView]      = useState('cal');
  const [gestionTab,   setGestionTab]   = useState('profesionales');
  const [panelOpen,    setPanelOpen]    = useState(false);
  const [panelTab,     setPanelTab]     = useState('empresa');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [profs,        setProfs]        = useState(professionals);
  const [allSelected,  setAllSelected]  = useState(true);
  const [toast,        setToast]        = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [abono,        setAbono]        = useState('');
  const [mClient,      setMClient]      = useState('');
  const [payMethod,    setPayMethod]    = useState('Efectivo');

  // ── TOAST ────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // ── PROFESIONALES ────────────────────────────────────
  const toggleProf = (i) => {
    const updated = [...profs];
    updated[i] = { ...updated[i], on: !updated[i].on };
    setProfs(updated);
  };

  const toggleAll = () => {
    const next = !allSelected;
    setAllSelected(next);
    setProfs(profs.map(p => ({ ...p, on: next })));
  };

  // ── CÁLCULOS MODAL ───────────────────────────────────
  const saldo = Math.max(0, currentTotal - (parseInt(abono) || 0));

  const saveAppt = () => {
    if (!mClient.trim()) { showToast('Por favor ingresa el nombre del cliente'); return; }
    setModalOpen(false);
    setMClient('');
    showToast('Cita guardada exitosamente');
  };

  // ── RENDER ───────────────────────────────────────────
  return (
      <motion.div
        className="app"
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ duration:.3 }}
      >

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
            <button
              key={v}
              className={`nav-tab ${currentView === v ? 'active' : ''}`}
              onClick={() => setCurrentView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <div className="nav-right">
          <button className="notif-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="notif-badge">3</span>
          </button>
          <button className="avatar-btn" onClick={() => setPanelOpen(!panelOpen)}>KG</button>
        </div>
      </nav>

      {/* MAIN */}
      <div className="main">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Profesionales</div>
            <button className="select-all-btn" onClick={toggleAll}>
              Seleccionar / deseleccionar todos
            </button>
            <div style={{marginTop:'8px'}}>
              {profs.map((p, i) => (
                <div key={i} className="prof-item">
                  <div
                    className={`prof-check ${p.on ? 'checked' : ''}`}
                    style={p.on ? {background:p.color, borderColor:p.color} : {}}
                    onClick={() => toggleProf(i)}
                  >
                    {p.on ? '✓' : ''}
                  </div>
                  <div className="prof-avatar" style={{background:p.color}}>
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{flex:1}}>
                    <div className="prof-name">{p.name}</div>
                    <div style={{fontSize:'11px',color:'var(--tx3)'}}>{p.role}</div>
                  </div>
                  <div className={`prof-status ${p.on ? 'on' : 'off'}`}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Vista rápida</div>
            <div className="quick-stats">
              <div>Citas hoy: <strong>7</strong></div>
              <div>Confirmadas: <strong className="color-green">5</strong></div>
              <div>Pendientes: <strong className="color-gold">2</strong></div>
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <motion.main
          className="content"
          key={currentView}
          initial={{ opacity:0, y:12 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:.25 }}
        >
          {currentView === 'agenda'  && <AgendaView  profs={profs} calView={calView} setCalView={setCalView} openModal={() => setModalOpen(true)} />}
          {currentView === 'ventas'  && <VentasView  showToast={showToast} />}
          {currentView === 'gestion' && <GestionView profs={profs} toggleProf={toggleProf} gestionTab={gestionTab} setGestionTab={setGestionTab} showToast={showToast} />}
        </motion.main>
      </div>

      {/* MODAL NUEVA CITA */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="modal-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ duration: 0.22 }}
            >
            <div className="modal-header">
              <div className="modal-title">Nueva cita</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Cliente</label>
              <input className="form-input" type="text" placeholder="Buscar cliente..."
                value={mClient} onChange={e => setMClient(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <input className="form-input" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Profesional</label>
                <select className="form-input form-select">
                  {profs.map((p,i) => <option key={i}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hora inicio</label>
                <input className="form-input" type="time" defaultValue="09:00" />
              </div>
              <div className="form-group">
                <label className="form-label">Hora fin</label>
                <input className="form-input" type="time" defaultValue="10:00" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Servicio</label>
              <select className="form-input form-select"
                onChange={e => setCurrentTotal(parseInt(e.target.value) || 0)}>
                <option value="">Seleccionar servicio...</option>
                <option value="80000">Manicure completa — $80.000</option>
                <option value="120000">Facial hidratante — $120.000</option>
                <option value="150000">Masaje relajante — $150.000</option>
                <option value="60000">Depilación cejas — $60.000</option>
                <option value="200000">Pedicure spa — $200.000</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total</label>
                <input className="form-input" type="text" readOnly
                  style={{background:'var(--bg2)'}}
                  value={currentTotal ? '$' + currentTotal.toLocaleString('es-CO') : ''} />
              </div>
              <div className="form-group">
                <label className="form-label">Abono</label>
                <input className="form-input" type="number" placeholder="$0"
                  value={abono} onChange={e => setAbono(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Método de pago</label>
              <div className="payment-pills">
                {['Efectivo','Transferencia','Tarjeta'].map(m => (
                  <span key={m} className={`pill ${payMethod === m ? 'active' : ''}`}
                    onClick={() => setPayMethod(m)}>{m}</span>
                ))}
              </div>
            </div>

            <div className="total-row">
              <span className="total-label">Saldo pendiente:</span>
              <span className="total-val">
                {saldo ? '$' + saldo.toLocaleString('es-CO') : '$0'}
              </span>
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
      <motion.div
          className="side-panel"
          animate={{ x: panelOpen ? 0 : '100%' }}
          initial={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
        <div className="side-panel-header">
          <div className="side-panel-title">Mi cuenta</div>
          <button className="modal-close" onClick={() => setPanelOpen(false)}>✕</button>
        </div>
        <div className="panel-tabs">
          {[['empresa','Mi empresa'],['clientes','Clientes'],['config','Config.']].map(([k,l]) => (
            <button key={k} className={`panel-tab ${panelTab === k ? 'active' : ''}`}
              onClick={() => setPanelTab(k)}>{l}</button>
          ))}
        </div>

        {panelTab === 'empresa' && (
          <div className="panel-section">
            <div className="logo-upload" onClick={() => showToast('Selector de imagen')}>
              <div className="logo-upload-text">Cambiar logo del negocio</div>
            </div>
            <div className="panel-form-group" style={{marginTop:'14px'}}>
              <label className="panel-label">Nombre del negocio</label>
              <input className="panel-input" type="text" defaultValue="Entre Manos" />
            </div>
            <div className="panel-form-group">
              <label className="panel-label">Descripción</label>
              <textarea className="panel-input" rows="3" style={{resize:'none'}}
                defaultValue="Centro de estética y bienestar especializado en tratamientos personalizados." />
            </div>
            <div className="panel-form-group">
              <label className="panel-label">Instagram</label>
              <input className="panel-input" type="text" placeholder="@entremanos" />
            </div>
            <div className="panel-form-group">
              <label className="panel-label">WhatsApp</label>
              <input className="panel-input" type="text" placeholder="+57 300 000 0000" />
            </div>
            <button className="save-btn" onClick={() => showToast('Cambios guardados')}>
              Guardar cambios
            </button>
            <div className="logout-row" onClick={() => showToast('Sesión cerrada')}>
              Cerrar sesión
            </div>
          </div>
        )}

        {panelTab === 'clientes' && (
          <div className="panel-section">
            <input className="panel-input" type="text" placeholder="Buscar cliente..."
              style={{marginBottom:'14px'}} />
            {clients.map((c, i) => (
              <div key={i} className="client-item">
                <div className="client-avatar">{c.name.split(' ').map(n=>n[0]).join('')}</div>
                <div className="client-info">
                  <div className="client-name">{c.name}</div>
                  <div className="client-meta">{c.phone} · {c.visits} citas</div>
                </div>
                <div className="client-actions">
                  <button className="client-action-btn"
                    onClick={() => showToast(`Editando ${c.name}`)}>Editar</button>
                  <button className="client-action-btn block"
                    onClick={() => showToast(`${c.name} bloqueado`)}>🚫</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {panelTab === 'config' && (
          <div className="panel-section">
            <div className="panel-form-group">
              <label className="panel-label">Apertura</label>
              <input className="panel-input" type="time" defaultValue="09:00" />
            </div>
            <div className="panel-form-group">
              <label className="panel-label">Cierre</label>
              <input className="panel-input" type="time" defaultValue="19:00" />
            </div>
            <div className="panel-form-group">
              <label className="panel-label">Anticipación mínima (horas)</label>
              <input className="panel-input" type="number" defaultValue="2" min="1" />
            </div>
            <div className="panel-form-group">
              <label className="panel-label">Abono mínimo (%)</label>
              <input className="panel-input" type="number" defaultValue="50" min="0" max="100" />
            </div>
            <button className="save-btn" onClick={() => showToast('Configuración guardada')}>
              Guardar
            </button>
          </div>
        )}
      </motion.div>

      {/* TOAST */}
      <div className={`toast ${toastVisible ? 'show' : ''}`}>{toast}</div>

    </motion.div>
  );
}

// ── SUBCOMPONENTES ────────────────────────────────────

function AgendaView({ profs, calView, setCalView, openModal }) {
  const dates = [26,27,28,29,30,31];
  return (
    <>
      <div className="agenda-header">
        <div className="agenda-title">Agenda</div>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div className="week-nav">
            <button className="week-nav-btn">‹</button>
            <div className="week-label">26 May – 31 May 2026</div>
            <button className="week-nav-btn">›</button>
          </div>
          <div className="view-toggle">
            <button className={`view-btn ${calView==='cal'?'active':''}`} onClick={()=>setCalView('cal')}>Calendario</button>
            <button className={`view-btn ${calView==='list'?'active':''}`} onClick={()=>setCalView('list')}>Lista</button>
          </div>
        </div>
      </div>

      {calView === 'cal' ? (
        <div className="cal-grid">
          <div className="cal-header"></div>
          {DAYS.map((d,i) => (
            <div key={i} className={`cal-header day-col ${i===1?'today':''}`}>
              <div>{d}</div><span>{dates[i]}</span>
            </div>
          ))}
          {HOURS.map(h => (
            <React.Fragment key={h}>
              <div className="time-cell">{h}</div>
              {DAYS.map((_, di) => {
                const appt = appointments.find(a =>
                  a.day===di && Math.floor(a.hour)===parseInt(h) && profs[a.prof]?.on
                );
                const p = appt ? profs[appt.prof] : null;
                return (
                  <div key={di} className="cal-cell" onClick={openModal}>
                    {appt && p && (
                      <div className="appointment-block"
                        style={{background:`${p.color}20`,borderLeft:`3px solid ${p.color}`,height:`${46*Math.min(appt.height,1)}px`}}>
                        <div className="appt-client" style={{color:p.color}}>{appt.client}</div>
                        <div className="appt-service">{appt.service}</div>
                      </div>
                    )}
                    <div className="add-hint">+ Nueva cita</div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div style={{background:'var(--bg3)',border:'1px solid var(--bdr)',borderRadius:'12px',overflow:'hidden'}}>
          <table className="list-table">
            <thead><tr>
              <th>Fecha</th><th>Hora</th><th>Cliente</th><th>Servicio</th>
              <th>Profesional</th><th>Estado</th><th>Abono</th>
            </tr></thead>
            <tbody>
              {appointments.filter(a => profs[a.prof]?.on).map((a,i) => {
                const p = profs[a.prof];
                const estados = ['conf','pend','conf','canc','conf','pend'];
                const labels  = ['Confirmada','Pendiente','Confirmada','Cancelada','Confirmada','Pendiente'];
                return (
                  <tr key={i}>
                    <td>26 May 2026</td>
                    <td>{String(a.hour).padStart(2,'0')}:00</td>
                    <td><strong>{a.client}</strong></td>
                    <td>{a.service}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                        <div style={{width:'24px',height:'24px',borderRadius:'50%',background:p.color,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:'9px',color:'#fff',fontWeight:'600'}}>
                          {p.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        {p.name.split(' ')[0]}
                      </div>
                    </td>
                    <td><span className={`status-badge ${estados[i]}`}>{labels[i]}</span></td>
                    <td style={{color:'var(--pri)',fontWeight:'600'}}>$40.000</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <button className="fab" onClick={openModal}>+</button>
    </>
  );
}

function VentasView({ showToast }) {
  const [periodo, setPeriodo] = useState('Hoy');
  const bars   = [65,80,45,90,70,55,85,95,60,75,88,72];
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return (
    <>
      <div className="agenda-header"><div className="agenda-title">Ventas y reportes</div></div>
      <div className="period-tabs">
        {['Hoy','Semana','Mes','Año'].map(p => (
          <button key={p} className={`period-tab ${periodo===p?'active':''}`}
            onClick={() => setPeriodo(p)}>{p}</button>
        ))}
      </div>
      <div className="stats-grid">
        {[
          ['Ingresos totales','$1.24M','+12% vs mes anterior','var(--pri)'],
          ['Citas completadas','87','+5 esta semana','var(--pri)'],
          ['Abonos recibidos','$620K','50% del total','var(--pri)'],
          ['Cancelaciones','4','-2 vs semana pasada','var(--err)'],
        ].map(([label,val,sub,color]) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{val}</div>
            <div className="stat-sub" style={{color}}>{sub}</div>
          </div>
        ))}
      </div>
      <div className="chart-card">
        <div className="chart-title">Ingresos mensuales 2026</div>
        <div className="bar-chart">
          {bars.map((b,i) => (
            <div key={i} className="bar-wrap">
              <div className="bar" style={{height:`${b}%`,opacity:i===4?1:.6}}></div>
              <div className="bar-label">{months[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function GestionView({ profs, toggleProf, gestionTab, setGestionTab, showToast }) {
  const tabs = ['profesionales','servicios','horarios','whatsapp'];
  const labels = ['Profesionales','Servicios','Horarios','Notificaciones'];
  return (
    <>
      <div className="agenda-header"><div className="agenda-title">Gestión</div></div>
      <div className="gestion-tabs">
        {tabs.map((t,i) => (
          <button key={t} className={`gestion-tab ${gestionTab===t?'active':''}`}
            onClick={() => setGestionTab(t)}>{labels[i]}</button>
        ))}
      </div>
      {gestionTab === 'profesionales' && (
        <div className="prof-cards">
          {profs.map((p,i) => (
            <div key={i} className="prof-card">
              <div className="prof-card-avatar" style={{background:p.color}}>
                {p.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="prof-card-name">{p.name}</div>
              <div className="prof-card-role">{p.role}</div>
              <div className="toggle-wrap">
                <button className={`toggle ${p.on?'on':'off'}`} onClick={() => toggleProf(i)}>
                  <div className="toggle-dot"></div>
                </button>
                <span className="toggle-label">{p.on?'Activo':'Inactivo'}</span>
              </div>
              <div className="card-actions">
                <button className="card-btn edit" onClick={() => showToast(`Editando ${p.name}`)}>Editar</button>
                <button className="card-btn del" onClick={() => showToast('Eliminar')}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {gestionTab === 'servicios' && (
        <div className="svc-cards">
          {services.map((s,i) => (
            <div key={i} className="svc-card">
              <div className="svc-img" onClick={() => showToast('Cambiar imagen')}>
                <span style={{fontSize:'36px'}}>{s.icon}</span>
                <div className="svc-img-label">Clic para cambiar imagen</div>
              </div>
              <div className="svc-body">
                <div className="svc-name">{s.name}</div>
                <div className="svc-meta">
                  <span className="svc-price">{s.price}</span>
                  <span className="svc-dur">⏱ {s.dur}</span>
                </div>
                <div className="card-actions">
                  <button className="card-btn edit" onClick={() => showToast(`Editando ${s.name}`)}>Editar</button>
                  <button className="card-btn del" onClick={() => showToast('Eliminar')}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}