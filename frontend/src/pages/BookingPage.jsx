import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI, professionalsAPI, appointmentsAPI, clientsAPI, settingsAPI } from '../services/api';
import '../styles/public-landing.css';

const STEPS = ['Servicio','Profesional','Fecha y hora','Tus datos','Confirmar'];

export default function BookingPage() {
  const navigate  = useNavigate();
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  // ── Datos de la API ──────────────────────────────────────────
  const [services,      setServices]      = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [availableSlots,setAvailableSlots]= useState([]);
  const [loadingSlots,  setLoadingSlots]  = useState(false);

  // ── Selecciones del cliente ──────────────────────────────────
  const [selectedService,      setSelectedService]      = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate,         setSelectedDate]         = useState('');
  const [selectedSlot,         setSelectedSlot]         = useState('');

  // ── Cuestionario previo ──────────────────────────────────────
  const [tieneEsmalte,   setTieneEsmalte]   = useState(false);
  const [tipoEsmalte,    setTipoEsmalte]    = useState('');
  const [tiempoExtra,    setTiempoExtra]    = useState(0);
  const [costoExtra,     setCostoExtra]     = useState(0);

  // ── Datos del cliente ─────────────────────────────────────────
  const [clienteNombre,  setClienteNombre]  = useState('');
  const [clienteTel,     setClienteTel]     = useState('');
  const [clienteEmail,   setClienteEmail]   = useState('');
  const [abono,          setAbono]          = useState('');
  const [minDepositPct, setMinDepositPct] = useState(50);

  useEffect(() => {
    settingsAPI.getBusiness()
      .then(res => setMinDepositPct(parseFloat(res.data.minimum_deposit_percent) || 50))
      .catch(() => {});
  }, []);
  // ── Cargar servicios al montar ────────────────────────────────
  useEffect(() => {
    servicesAPI.getPublic()
      .then(res => setServices(res.data.filter(s => s.activo)))
      .catch(() => setError('Error cargando servicios'));
  }, []);

  // ── Cargar profesionales al seleccionar servicio ──────────────
  useEffect(() => {
    if (!selectedService) return;
    professionalsAPI.getPublic()
      .then(res => {
        // Filtrar profesionales que realizan este servicio
        const filtered = res.data.filter(p =>
          p.activo &&
          (p.services?.length === 0 ||
           p.services?.some(s => s.id === selectedService.id))
        );
        setProfessionals(filtered);
      })
      .catch(() => setError('Error cargando profesionales'));
  }, [selectedService]);

  // ── Calcular tiempo y costo extra por cuestionario ────────────
  useEffect(() => {
    if (!tieneEsmalte) { setTiempoExtra(0); setCostoExtra(0); return; }
    if (tipoEsmalte === 'semipermanente') { setTiempoExtra(20); setCostoExtra(15000); }
    else if (tipoEsmalte === 'acrilico')  { setTiempoExtra(30); setCostoExtra(20000); }
    else                                  { setTiempoExtra(10); setCostoExtra(8000);  }
  }, [tieneEsmalte, tipoEsmalte]);

  // ── Cargar slots disponibles ──────────────────────────────────
  useEffect(() => {
    if (!selectedProfessional || !selectedDate || !selectedService) return;
    setLoadingSlots(true);
    setAvailableSlots([]);

    const duracionTotal = (selectedService.duracion || 60) + tiempoExtra;

    // Generar slots del día y verificar disponibilidad
    const generateAndCheck = async () => {
      try {
        const appts = await appointmentsAPI.getByProfessional(selectedProfessional.id);
        const citasDelDia = appts.data.filter(a => {
          const f = new Date(a.fecha_inicio);

          return (
            f.toDateString() === new Date(selectedDate).toDateString() &&
            a.estado !== 'cancelada'
          );
        });

        // Slots de 30 en 30 desde 9am hasta 7pm
        const slots = [];
        for (let h = 9; h < 19; h++) {
          for (let m of [0, 30]) {
            const slotStart = new Date(`${selectedDate}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`);
            const slotEnd   = new Date(slotStart.getTime() + duracionTotal * 60000);

            // Verificar anticipación mínima (2 horas)
            const ahora = new Date();
            if (slotStart < new Date(ahora.getTime() + 2 * 3600000)) continue;

            // Verificar que no choca con citas existentes
            const choca = citasDelDia.some(a => {
              const aStart = new Date(a.fecha_inicio);
              const aEnd   = new Date(a.fecha_fin);

              return slotStart < aEnd && slotEnd > aStart;
            });

            if (!choca && slotEnd.getHours() <= 19) {
              slots.push({
                inicio:  `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
                fin:     `${String(slotEnd.getHours()).padStart(2,'0')}:${String(slotEnd.getMinutes()).padStart(2,'0')}`,
                label:   `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} — ${String(slotEnd.getHours()).padStart(2,'0')}:${String(slotEnd.getMinutes()).padStart(2,'0')}`
              });
            }
          }
        }
        setAvailableSlots(slots);
      } catch {
        setError('Error verificando disponibilidad');
      } finally {
        setLoadingSlots(false);
      }
    };

    generateAndCheck();
  }, [selectedProfessional, selectedDate, selectedService, tiempoExtra]);

  // ── Totales ──────────────────────────────────────────────────
  const precioTotal   = (selectedService?.precio || 0) + costoExtra;
  const abonoMinimo = precioTotal * (minDepositPct / 100);
  const saldo         = Math.max(0, precioTotal - (parseFloat(abono) || 0));

  // ── Fecha mínima (hoy) ────────────────────────────────────────
  const fechaMinima = new Date().toISOString().split('T')[0];

  // ── Confirmar reserva ─────────────────────────────────────────
  const confirmarReserva = async () => {
    if (!clienteNombre.trim()) { setError('El nombre es obligatorio'); return; }
    if (!clienteTel.trim())    { setError('El teléfono es obligatorio'); return; }
    if (parseFloat(abono) < abonoMinimo) {
      setError(`El abono mínimo es $${abonoMinimo.toLocaleString('es-CO')}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 1. Crear o buscar cliente
      let clienteId;
      try {
        const res = await clientsAPI.create({
          nombre:   clienteNombre,
          telefono: clienteTel,
          email:    clienteEmail || null,
        });
        clienteId = res.data.id;
      } catch (err) {
        // Si ya existe, buscar por teléfono
        if (err.response?.status === 400) {
          const busq = await clientsAPI.search(clienteTel);
          clienteId = busq.data[0]?.id;
        } else throw err;
      }

      if (!clienteId) throw new Error('No se pudo identificar el cliente');

      // 2. Crear la cita
      const slot = availableSlots.find(s => s.inicio === selectedSlot);
      await appointmentsAPI.create({
        client_id:       clienteId,
        professional_id: selectedProfessional.id,
        service_id:      selectedService.id,
        fecha_inicio:    `${selectedDate}T${slot.inicio}:00`,
        fecha_fin:       `${selectedDate}T${slot.fin}:00`,
        precio_total:    precioTotal,
        abono:           parseFloat(abono),
        metodo_pago:     'efectivo',
        en_lista_espera: false,
        cuestionario:    tieneEsmalte
          ? JSON.stringify({ tiene_esmalte: true, tipo_esmalte: tipoEsmalte })
          : null,
        costo_adicional: costoExtra,
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al confirmar la reserva');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)',
      fontFamily:'Inter,sans-serif', flexDirection:'column', gap:'16px'
    }}>
      <div style={{
        width:'64px', height:'64px', borderRadius:'50%',
        background:'var(--pri-lt)', display:'flex',
        alignItems:'center', justifyContent:'center'
      }}>
        <svg width="32" height="32" fill="none" stroke="var(--pri)"
          strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
      </div>
      <h2 style={{fontFamily:'Playfair Display,serif',color:'var(--tx)'}}>
        Reserva confirmada
      </h2>
      <p style={{color:'var(--tx2)',fontSize:'14px',textAlign:'center',maxWidth:'320px'}}>
        Tu cita con <strong>{selectedProfessional?.nombre}</strong> para{' '}
        <strong>{selectedService?.nombre}</strong> el{' '}
        <strong>{new Date(selectedDate).toLocaleDateString('es-CO',{
          weekday:'long', day:'numeric', month:'long'
        })}</strong> a las <strong>{selectedSlot}</strong> ha sido registrada.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding:'12px 28px', background:'var(--pri)',
          color:'#fff', border:'none', borderRadius:'24px',
          fontSize:'14px', fontWeight:'600', cursor:'pointer'
        }}>
        Volver al inicio
      </button>
    </div>
  );

  return (
    <div style={{
      minHeight:'100vh', background:'var(--bg)',
      fontFamily:'Inter,sans-serif', padding:'0 0 60px'
    }}>

      {/* Header */}
      <div style={{
        background:'#fff', borderBottom:'1px solid var(--bdr)',
        padding:'16px 24px', display:'flex', alignItems:'center',
        justifyContent:'space-between', position:'sticky', top:0, zIndex:10
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}}
          onClick={() => navigate('/')}>
          <div style={{
            width:'32px', height:'32px', background:'var(--pri)',
            borderRadius:'8px', display:'flex', alignItems:'center',
            justifyContent:'center'
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
              width="18" height="18">
              <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
          </div>
          <span style={{fontFamily:'Playfair Display,serif',fontSize:'16px',fontWeight:'700'}}>
            Entre<span style={{color:'var(--pri)'}}>Manos</span>
          </span>
        </div>
        <span style={{fontSize:'13px',color:'var(--tx2)'}}>
          Agendar cita
        </span>
      </div>

      {/* Stepper */}
      <div style={{padding:'24px 24px 0',maxWidth:'640px',margin:'0 auto'}}>
        <div style={{display:'flex',gap:'4px',marginBottom:'32px'}}>
          {STEPS.map((s,i) => (
            <div key={i} style={{flex:1}}>
              <div style={{
                height:'3px', borderRadius:'2px',
                background: i <= step ? 'var(--pri)' : 'var(--bdr)',
                transition:'background .3s'
              }}/>
              <div style={{
                fontSize:'10px', marginTop:'4px', fontWeight:'500',
                color: i === step ? 'var(--pri)' : 'var(--tx3)',
                transition:'color .3s'
              }}>{s}</div>
            </div>
          ))}
        </div>

        {/* PASO 0 — Elegir servicio */}
        {step === 0 && (
          <div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'22px',
              color:'var(--tx)',marginBottom:'6px'}}>
              ¿Qué servicio deseas?
            </h2>
            <p style={{color:'var(--tx2)',fontSize:'13px',marginBottom:'24px'}}>
              Selecciona el tratamiento que buscas
            </p>
            {services.length === 0 && (
              <div style={{textAlign:'center',padding:'40px',color:'var(--tx2)'}}>
                Cargando servicios...
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {services.map(s => (
                <div key={s.id}
                  onClick={() => { setSelectedService(s); setStep(1); }}
                  style={{
                    padding:'16px 18px', background:'#fff',
                    border:`2px solid ${selectedService?.id===s.id ? 'var(--pri)' : 'var(--bdr)'}`,
                    borderRadius:'14px', cursor:'pointer',
                    transition:'all .2s',
                    boxShadow: selectedService?.id===s.id ? '0 4px 16px rgba(74,124,89,.15)' : 'none'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='var(--pri)'}
                  onMouseLeave={e => {
                    if (selectedService?.id !== s.id)
                      e.currentTarget.style.borderColor='var(--bdr)';
                  }}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontWeight:'600',color:'var(--tx)',fontSize:'15px',marginBottom:'4px'}}>
                        {s.nombre}
                      </div>
                      <div style={{fontSize:'12px',color:'var(--tx2)',marginBottom:'8px'}}>
                        {s.descripcion}
                      </div>
                      <div style={{fontSize:'12px',color:'var(--tx3)'}}>
                        ⏱ {s.duracion} min
                      </div>
                    </div>
                    <div style={{
                      fontSize:'17px',fontWeight:'700',color:'var(--pri)',
                      fontFamily:'Playfair Display,serif',whiteSpace:'nowrap',marginLeft:'16px'
                    }}>
                      ${Number(s.precio).toLocaleString('es-CO')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 1 — Cuestionario previo + elegir profesional */}
        {step === 1 && selectedService && (
          <div>
            <button onClick={() => setStep(0)} style={backBtnStyle}>← Volver</button>
            <h2 style={stepTitleStyle}>Antes de continuar</h2>
            <p style={stepSubStyle}>
              Necesitamos saber si tienes algo aplicado para calcular el tiempo exacto
            </p>

            {/* Cuestionario */}
            <div style={{
              background:'var(--bg2)', borderRadius:'12px',
              padding:'16px', marginBottom:'20px'
            }}>
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                marginBottom: tieneEsmalte ? '14px' : '0'
              }}>
                <span style={{fontSize:'14px',fontWeight:'500',color:'var(--tx)'}}>
                  ¿Tienes esmalte o producto aplicado actualmente?
                </span>
                <button
                  onClick={() => { setTieneEsmalte(!tieneEsmalte); setTipoEsmalte(''); }}
                  style={{
                    width:'40px',height:'22px',borderRadius:'11px',border:'none',
                    background: tieneEsmalte ? 'var(--pri)' : 'var(--bdr2)',
                    position:'relative',cursor:'pointer',transition:'background .2s'
                  }}>
                  <div style={{
                    width:'16px',height:'16px',borderRadius:'50%',background:'#fff',
                    position:'absolute',top:'3px',
                    left: tieneEsmalte ? '21px' : '3px',
                    transition:'left .2s'
                  }}/>
                </button>
              </div>
              {tieneEsmalte && (
                <div>
                  <p style={{fontSize:'12px',color:'var(--tx2)',marginBottom:'10px'}}>
                    ¿Qué tipo de producto tienes aplicado?
                  </p>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    {[
                      ['normal',         'Esmalte normal',    '+10 min'],
                      ['semipermanente', 'Semipermanente',    '+20 min'],
                      ['acrilico',       'Acrílico/Gel',      '+30 min'],
                    ].map(([val,lbl,extra]) => (
                      <button key={val}
                        onClick={() => setTipoEsmalte(val)}
                        style={{
                          padding:'8px 14px', borderRadius:'20px', border:'1.5px solid',
                          borderColor: tipoEsmalte===val ? 'var(--pri)' : 'var(--bdr2)',
                          background:  tipoEsmalte===val ? 'var(--pri-lt)' : '#fff',
                          color:       tipoEsmalte===val ? 'var(--pri)' : 'var(--tx2)',
                          fontSize:'12px',fontWeight:'500',cursor:'pointer',
                          fontFamily:'Inter,sans-serif', transition:'all .15s'
                        }}>
                        {lbl} <span style={{opacity:.7,fontSize:'11px'}}>{extra}</span>
                      </button>
                    ))}
                  </div>
                  {tipoEsmalte && (
                    <div style={{
                      marginTop:'12px',fontSize:'12px',
                      color:'var(--acc)',fontWeight:'500'
                    }}>
                      Se agregarán {tiempoExtra} min y ${costoExtra.toLocaleString('es-CO')} al costo del servicio
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Resumen duración */}
            <div style={{
              background:'var(--pri-lt)',border:'1px solid var(--pri)',
              borderRadius:'10px',padding:'12px 16px',marginBottom:'20px',
              fontSize:'13px',color:'var(--pri)',fontWeight:'500'
            }}>
              Duración total estimada: {selectedService.duracion + tiempoExtra} min
              {costoExtra > 0 && ` · Costo extra: $${costoExtra.toLocaleString('es-CO')}`}
            </div>

            {/* Elegir profesional */}
            <h3 style={{fontSize:'16px',fontWeight:'600',color:'var(--tx)',marginBottom:'14px'}}>
              Elige tu profesional
            </h3>
            {professionals.length === 0 && (
              <div style={{textAlign:'center',padding:'24px',color:'var(--tx2)',fontSize:'13px'}}>
                Cargando profesionales...
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {professionals.map((p,i) => (
                <div key={p.id}
                  onClick={() => setSelectedProfessional(p)}
                  style={{
                    padding:'14px 16px', background:'#fff',
                    border:`2px solid ${selectedProfessional?.id===p.id ? 'var(--pri)' : 'var(--bdr)'}`,
                    borderRadius:'12px', cursor:'pointer', display:'flex',
                    alignItems:'center', gap:'12px', transition:'all .2s'
                  }}>
                  <div style={{
                    width:'44px',height:'44px',borderRadius:'50%',flexShrink:0,
                    background:['#4A7C59','#C9A84C','#7B5EA7','#D94F4F'][i%4],
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:'16px',fontWeight:'700',color:'#fff'
                  }}>
                    {p.nombre.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:'600',color:'var(--tx)',fontSize:'14px'}}>
                      {p.nombre}
                    </div>
                    <div style={{fontSize:'12px',color:'var(--tx2)'}}>
                      {p.especialidad || 'Especialista'}
                    </div>
                  </div>
                  {selectedProfessional?.id===p.id && (
                    <svg width="18" height="18" fill="none" stroke="var(--pri)"
                      strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => { if (selectedProfessional) setStep(2); }}
              disabled={!selectedProfessional || (tieneEsmalte && !tipoEsmalte)}
              style={nextBtnStyle(!selectedProfessional || (tieneEsmalte && !tipoEsmalte))}>
              Continuar
            </button>
          </div>
        )}

        {/* PASO 2 — Fecha y hora */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={backBtnStyle}>← Volver</button>
            <h2 style={stepTitleStyle}>Elige fecha y hora</h2>
            <p style={stepSubStyle}>Selecciona cuándo quieres tu cita</p>

            <div className="form-group" style={{marginBottom:'20px'}}>
              <label style={labelStyle}>Fecha</label>
              <input type="date" min={fechaMinima}
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                style={inputStyle}
              />
            </div>

            {selectedDate && (
              <div>
                <label style={labelStyle}>Horario disponible</label>
                {loadingSlots && (
                  <div style={{textAlign:'center',padding:'24px',color:'var(--tx2)',fontSize:'13px'}}>
                    Verificando disponibilidad...
                  </div>
                )}
                {!loadingSlots && availableSlots.length === 0 && (
                  <div style={{
                    textAlign:'center',padding:'24px',color:'var(--tx2)',
                    fontSize:'13px',background:'var(--bg2)',borderRadius:'10px'
                  }}>
                    No hay horarios disponibles para esta fecha. Prueba con otra fecha.
                  </div>
                )}
                <div style={{
                  display:'grid',gridTemplateColumns:'repeat(3,1fr)',
                  gap:'8px',marginTop:'10px'
                }}>
                  {availableSlots.map(slot => (
                    <button key={slot.inicio}
                      onClick={() => setSelectedSlot(slot.inicio)}
                      style={{
                        padding:'10px', borderRadius:'10px', border:'1.5px solid',
                        borderColor: selectedSlot===slot.inicio ? 'var(--pri)' : 'var(--bdr)',
                        background:  selectedSlot===slot.inicio ? 'var(--pri-lt)' : '#fff',
                        color:       selectedSlot===slot.inicio ? 'var(--pri)' : 'var(--tx)',
                        fontSize:'13px',fontWeight:'500',cursor:'pointer',
                        fontFamily:'Inter,sans-serif',transition:'all .15s'
                      }}>
                      {slot.inicio}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { if (selectedDate && selectedSlot) setStep(3); }}
              disabled={!selectedDate || !selectedSlot}
              style={nextBtnStyle(!selectedDate || !selectedSlot)}>
              Continuar
            </button>
          </div>
        )}

        {/* PASO 3 — Datos del cliente */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} style={backBtnStyle}>← Volver</button>
            <h2 style={stepTitleStyle}>Tus datos</h2>
            <p style={stepSubStyle}>
              Los necesitamos para confirmar tu reserva y enviarte recordatorios
            </p>

            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div>
                <label style={labelStyle}>Nombre completo *</label>
                <input type="text" placeholder="Tu nombre"
                  value={clienteNombre} onChange={e => setClienteNombre(e.target.value)}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Teléfono *</label>
                <input type="tel" placeholder="+57 300 000 0000"
                  value={clienteTel} onChange={e => setClienteTel(e.target.value)}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email (opcional)</label>
                <input type="email" placeholder="tu@email.com"
                  value={clienteEmail} onChange={e => setClienteEmail(e.target.value)}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>
                  Abono (mínimo {minDepositPct}% = ${abonoMinimo.toLocaleString('es-CO')}) *
                </label>
                <input type="number" placeholder={`Mínimo $${abonoMinimo.toLocaleString('es-CO')}`}
                  value={abono} onChange={e => setAbono(e.target.value)}
                  style={inputStyle} />
                {parseFloat(abono) > 0 && parseFloat(abono) < abonoMinimo && (
                  <div style={{fontSize:'12px',color:'var(--err)',marginTop:'4px'}}>
                    El abono mínimo es el 50% del total
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div style={{
                marginTop:'12px',padding:'10px 14px',background:'var(--err-lt)',
                border:'1px solid #fbc',borderRadius:'8px',
                fontSize:'13px',color:'var(--err)'
              }}>
                {error}
              </div>
            )}

            <button
              onClick={() => {
                if (!clienteNombre || !clienteTel) { setError('Nombre y teléfono son obligatorios'); return; }
                if (parseFloat(abono) < abonoMinimo) { setError(`Abono mínimo: $${abonoMinimo.toLocaleString('es-CO')}`); return; }
                setError('');
                setStep(4);
              }}
              style={nextBtnStyle(!clienteNombre || !clienteTel)}>
              Ver resumen
            </button>
          </div>
        )}

        {/* PASO 4 — Confirmar */}
        {step === 4 && (
          <div>
            <button onClick={() => setStep(3)} style={backBtnStyle}>← Volver</button>
            <h2 style={stepTitleStyle}>Confirma tu reserva</h2>
            <p style={stepSubStyle}>Revisa los detalles antes de confirmar</p>

            <div style={{
              background:'#fff', border:'1px solid var(--bdr)',
              borderRadius:'16px', overflow:'hidden', marginBottom:'20px'
            }}>
              {[
                ['Servicio',      selectedService?.nombre],
                ['Profesional',   selectedProfessional?.nombre],
                ['Fecha',         selectedDate ? new Date(selectedDate+'T12:00:00').toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'}) : ''],
                ['Hora',          selectedSlot],
                ['Duración',      `${(selectedService?.duracion||0)+tiempoExtra} min`],
                ['Precio base',   `$${Number(selectedService?.precio||0).toLocaleString('es-CO')}`],
                costoExtra > 0 ? ['Retiro incluido', `+$${costoExtra.toLocaleString('es-CO')}`] : null,
                ['Total',         `$${precioTotal.toLocaleString('es-CO')}`],
                ['Abono hoy',     `$${Number(abono).toLocaleString('es-CO')}`],
                ['Saldo restante',`$${saldo.toLocaleString('es-CO')}`],
              ].filter(Boolean).map(([l,v], i) => (
                <div key={l} style={{
                  display:'flex',justifyContent:'space-between',
                  padding:'12px 18px',
                  borderBottom: i < 9 ? '1px solid var(--bdr)' : 'none',
                  background: l==='Total' ? 'var(--pri-lt)' : '#fff'
                }}>
                  <span style={{fontSize:'13px',color:'var(--tx2)'}}>{l}</span>
                  <span style={{
                    fontSize:'13px',fontWeight:'600',
                    color: l==='Total' ? 'var(--pri)' : 'var(--tx)'
                  }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{
              background:'var(--bg2)',borderRadius:'10px',
              padding:'12px 16px',marginBottom:'20px',
              fontSize:'12px',color:'var(--tx2)',lineHeight:'1.7'
            }}>
              Al confirmar, aceptas que el abono no es reembolsable en caso de cancelación
              con menos de 24 horas de anticipación.
            </div>

            {error && (
              <div style={{
                marginBottom:'14px',padding:'10px 14px',
                background:'var(--err-lt)',border:'1px solid #fbc',
                borderRadius:'8px',fontSize:'13px',color:'var(--err)'
              }}>
                {error}
              </div>
            )}

            <button onClick={confirmarReserva} disabled={loading}
              style={nextBtnStyle(loading)}>
              {loading ? 'Confirmando...' : 'Confirmar reserva'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Estilos reutilizables ────────────────────────────────────────
const backBtnStyle = {
  background:'none', border:'none', color:'var(--tx2)',
  fontSize:'13px', cursor:'pointer', padding:'0 0 16px',
  fontFamily:'Inter,sans-serif', fontWeight:'500'
};

const stepTitleStyle = {
  fontFamily:'Playfair Display,serif', fontSize:'22px',
  color:'var(--tx)', marginBottom:'6px'
};

const stepSubStyle = {
  color:'var(--tx2)', fontSize:'13px', marginBottom:'24px'
};

const labelStyle = {
  display:'block', fontSize:'11px', fontWeight:'600',
  color:'var(--tx2)', textTransform:'uppercase',
  letterSpacing:'.4px', marginBottom:'6px'
};

const inputStyle = {
  width:'100%', padding:'10px 14px',
  border:'1.5px solid var(--bdr)', borderRadius:'10px',
  fontSize:'14px', fontFamily:'Inter,sans-serif',
  color:'var(--tx)', background:'#fff', outline:'none',
  boxSizing:'border-box'
};

const nextBtnStyle = (disabled) => ({
  width:'100%', marginTop:'24px', padding:'14px',
  background: disabled ? 'var(--bdr)' : 'var(--pri)',
  color: disabled ? 'var(--tx3)' : '#fff',
  border:'none', borderRadius:'12px', fontSize:'15px',
  fontWeight:'600', cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily:'Inter,sans-serif', transition:'all .2s'
});