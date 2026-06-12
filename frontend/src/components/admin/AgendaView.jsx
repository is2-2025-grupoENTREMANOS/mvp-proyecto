import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { appointmentsAPI } from '../../services/api';

const DAY_LABELS  = ['Lun','Mar','Mié','Jue','Vie','Sáb'];
const STATUS_CLASS = {
  pendiente:'pend', confirmada:'conf',
  cancelada:'canc', completada:'done', en_espera:'pend'
};
const STATUS_COLOR = {
  pendiente:'#C9A84C', confirmada:'#4A7C59',
  cancelada:'#D94F4F', completada:'#B0A99F', en_espera:'#3B82F6'
};
const STATUS_LABEL = {
  pendiente:'Pendiente', confirmada:'Confirmada',
  cancelada:'Cancelada', completada:'Finalizada', en_espera:'En espera'
};

// ── Semana actual ─────────────────────────────────────────────
function getCurrentWeekDays() {
  const today = new Date();
  const dow   = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function AgendaView({
  professionals = [],
  appointments  = [],
  hourSlots     = [],
  calView,
  setCalView,
  onSlotClick,       // (slotData) => void  — slot clickeado
  onApptClick,       // (appt) => void
  onCancel,          // (id) => void
  loadingAppts,
  services = [],
}) {
  const [weekDays]      = useState(getCurrentWeekDays);
  const [selectedAppt,  setSelectedAppt] = useState(null);

  // Mapa de color por profesional
  const PROF_COLORS = ['#8B5CF6','#EC4899','#06B6D4','#10B981','#F59E0B','#EF4444'];
  const profColorMap = {};
  professionals.forEach((p, i) => {
    profColorMap[p.id] = PROF_COLORS[i % PROF_COLORS.length];
  });

  // Citas en un slot específico
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

  // Click en slot vacío → pasar fecha y hora exactas
  const handleSlotClick = (dayIndex, slotTime) => {
    const dayDate = weekDays[dayIndex];
    if (!dayDate) return;
    const [h, m] = slotTime.split(':');
    const fecha = dayDate.toISOString().split('T')[0];
    onSlotClick?.({ fecha, hora: `${h}:${m}`, dayDate });
  };

  const semanaLabel = weekDays.length > 0
    ? `${weekDays[0].toLocaleDateString('es-CO',{day:'2-digit',month:'short'})} – ${weekDays[5].toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})}`
    : '';

  return (
    <>
      {/* Header */}
      <div className="agenda-header">
        <div className="agenda-title">Agenda</div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div className="week-nav">
            <button className="week-nav-btn">&#8249;</button>
            <div className="week-label">{semanaLabel}</div>
            <button className="week-nav-btn">&#8250;</button>
          </div>
          <div className="view-toggle">
            <button className={`view-btn ${calView==='cal'?'active':''}`}
              onClick={() => setCalView('cal')}>Calendario</button>
            <button className={`view-btn ${calView==='list'?'active':''}`}
              onClick={() => setCalView('list')}>Lista</button>
          </div>
        </div>
      </div>

      {loadingAppts && (
        <div style={{ textAlign:'center', padding:'40px',
          color:'var(--tx2)', fontSize:'13px' }}>
          Cargando agenda...
        </div>
      )}

      {/* MODO CALENDARIO */}
      {!loadingAppts && calView === 'cal' && (
        <div style={{
          display:'grid',
          gridTemplateColumns:`60px repeat(6,1fr)`,
          border:'1px solid var(--bdr)',
          borderRadius:'12px',
          overflow:'hidden',
          background:'var(--bg3)'
        }}>
          {/* Headers días */}
          <div style={{ background:'var(--bg2)', padding:'10px', borderBottom:'1px solid var(--bdr)', borderRight:'1px solid var(--bdr)' }}></div>
          {weekDays.map((d, i) => {
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={i} style={{
                background:'var(--bg2)', padding:'10px 8px',
                textAlign:'center', borderBottom:'1px solid var(--bdr)',
                borderRight: i < 5 ? '1px solid var(--bdr)' : 'none',
                fontSize:'11px', color:'var(--tx2)'
              }}>
                {DAY_LABELS[i]}
                <div style={{
                  fontSize:'18px', fontWeight:'700',
                  color: isToday ? '#fff' : 'var(--tx)',
                  width:'32px', height:'32px', borderRadius:'50%',
                  background: isToday ? 'var(--pri)' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'2px auto 0'
                }}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}

          {/* Slots de hora */}
          {hourSlots.map(slot => (
            <React.Fragment key={slot}>
              <div style={{
                padding:'4px 8px 0',
                borderRight:'1px solid var(--bdr)',
                borderBottom:'1px solid var(--bdr)',
                fontSize:'11px', color:'var(--tx3)',
                minHeight:'54px'
              }}>
                {slot}
              </div>

              {weekDays.map((_, di) => {
                const appts = getApptInSlot(di, slot);
                const isEmpty = appts.length === 0;
                return (
                  <div key={di}
                    onClick={() => isEmpty && handleSlotClick(di, slot)}
                    style={{
                      borderRight: di < 5 ? '1px solid var(--bdr)' : 'none',
                      borderBottom:'1px solid var(--bdr)',
                      minHeight:'54px', position:'relative',
                      cursor: isEmpty ? 'pointer' : 'default',
                      transition:'background .15s',
                    }}
                    onMouseEnter={e => { if (isEmpty) e.currentTarget.style.background='var(--pri-lt)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background=''; }}
                  >
                    {/* Múltiples citas en el slot */}
                    {appts.length > 0 && (
                      <div style={{
                        position:'absolute', inset:'2px',
                        display:'flex', gap:'2px'
                      }}>
                        {appts.map((a, ai) => {
                          const color = profColorMap[a.professional_id] || 'var(--pri)';
                          return (
                            <div key={a.id || ai}
                              onClick={e => { e.stopPropagation(); setSelectedAppt(a); }}
                              style={{
                                flex:1, minWidth:0, cursor:'pointer',
                                background:`${color}18`,
                                borderLeft:`3px solid ${color}`,
                                borderRadius:'5px', padding:'3px 5px',
                                fontSize:'10px', overflow:'hidden',
                                transition:'transform .15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
                              onMouseLeave={e => e.currentTarget.style.transform=''}
                            >
                              <div style={{
                                fontWeight:'600', color,
                                whiteSpace:'nowrap', overflow:'hidden',
                                textOverflow:'ellipsis'
                              }}>
                                {a.client?.nombre?.split(' ')[0] || 'Cliente'}
                              </div>
                              <div style={{
                                opacity:.8, fontSize:'10px',
                                whiteSpace:'nowrap', overflow:'hidden',
                                textOverflow:'ellipsis'
                              }}>
                                {a.service?.nombre || ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {isEmpty && (
                      <div style={{
                        position:'absolute', inset:0,
                        display:'flex', alignItems:'center',
                        justifyContent:'center', fontSize:'11px',
                        color:'var(--pri)', fontWeight:'500',
                        opacity:0, transition:'opacity .15s'
                      }}
                        className="add-hint">
                        + Nueva cita
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* MODO LISTA */}
      {!loadingAppts && calView === 'list' && (
        <div style={{
          background:'var(--bg3)', border:'1px solid var(--bdr)',
          borderRadius:'12px', overflow:'hidden'
        }}>
          <table className="list-table">
            <thead><tr>
              <th>Fecha</th><th>Hora</th><th>Cliente</th>
              <th>Servicio</th><th>Profesional</th>
              <th>Estado</th><th>Abono</th><th>Acc.</th>
            </tr></thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="8" style={{
                  textAlign:'center', padding:'32px',
                  color:'var(--tx2)', fontSize:'13px'
                }}>
                  Sin citas registradas
                </td></tr>
              ) : appointments.map(a => (
                <tr key={a.id} style={{ cursor:'pointer' }}
                  onClick={() => setSelectedAppt(a)}>
                  <td>{new Date(a.fecha_inicio).toLocaleDateString('es-CO')}</td>
                  <td>{new Date(a.fecha_inicio).toLocaleTimeString('es-CO',{
                    hour:'2-digit', minute:'2-digit'
                  })}</td>
                  <td><strong>{a.client?.nombre || '—'}</strong></td>
                  <td>{a.service?.nombre || '—'}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{
                        width:'20px', height:'20px', borderRadius:'50%',
                        background: profColorMap[a.professional_id] || 'var(--pri)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'8px', color:'#fff', fontWeight:'700'
                      }}>
                        {(a.professional?.nombre || 'P')
                          .split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      {a.professional?.nombre?.split(' ')[0] || '—'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${STATUS_CLASS[a.estado] || 'pend'}`}>
                      {STATUS_LABEL[a.estado] || a.estado}
                    </span>
                  </td>
                  <td style={{ color:'var(--pri)', fontWeight:'600' }}>
                    ${Number(a.abono || 0).toLocaleString('es-CO')}
                  </td>
                  <td>
                    <button className="action-btn"
                      onClick={e => { e.stopPropagation(); onCancel?.(a.id); }}
                      title="Cancelar">
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detalle cita */}
      <AnimatePresence>
        {selectedAppt && (
          <motion.div className="modal-overlay open"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => e.target === e.currentTarget && setSelectedAppt(null)}>
            <motion.div className="modal"
              initial={{ opacity:0, scale:.93 }}
              animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:.93 }}>
              <div className="modal-header">
                <div className="modal-title">Detalle de cita</div>
                <button className="modal-close" onClick={() => setSelectedAppt(null)}>✕</button>
              </div>
              {[
                ['Cliente',     selectedAppt.client?.nombre || '—'],
                ['Servicio',    selectedAppt.service?.nombre || '—'],
                ['Profesional', selectedAppt.professional?.nombre || '—'],
                ['Fecha',       new Date(selectedAppt.fecha_inicio).toLocaleDateString('es-CO',{
                                  weekday:'long', day:'numeric', month:'long'
                                })],
                ['Hora',        new Date(selectedAppt.fecha_inicio).toLocaleTimeString('es-CO',{
                                  hour:'2-digit', minute:'2-digit'
                                })],
                ['Estado',      STATUS_LABEL[selectedAppt.estado] || selectedAppt.estado],
                ['Total',       `$${Number(selectedAppt.precio_total||0).toLocaleString('es-CO')}`],
                ['Abono',       `$${Number(selectedAppt.abono||0).toLocaleString('es-CO')}`],
                ['Saldo',       `$${Math.max(0, Number(selectedAppt.precio_total||0) - Number(selectedAppt.abono||0)).toLocaleString('es-CO')}`],
                selectedAppt.notas ? ['Notas', selectedAppt.notas] : null,
              ].filter(Boolean).map(([l, v]) => (
                <div key={l} className="modal-detail-row">
                  <div className="modal-detail-label">{l}</div>
                  <div className="modal-detail-value">
                    {l === 'Estado'
                      ? <span className={`status-badge ${STATUS_CLASS[selectedAppt.estado] || 'pend'}`}>{v}</span>
                      : v}
                  </div>
                </div>
              ))}
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setSelectedAppt(null)}>Cerrar</button>
                {selectedAppt.estado !== 'cancelada' && selectedAppt.estado !== 'completada' && (
                  <button className="btn-save"
                    style={{ background:'var(--err)' }}
                    onClick={() => { onCancel?.(selectedAppt.id); setSelectedAppt(null); }}>
                    Cancelar cita
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`.add-hint { opacity: 0; } .cal-cell:hover .add-hint { opacity: 1; }`}</style>
    </>
  );
}