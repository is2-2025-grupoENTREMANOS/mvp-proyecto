import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsAPI, appointmentsAPI } from '../services/api';
import '../styles/client-portal.css';

// ── Constantes ────────────────────────────────────────────────
const STATUS_LABEL = {
  pendiente:  'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Finalizada',
  cancelada:  'Cancelada',
  en_espera:  'En espera',
};

// Qué estados van en cada tab
const TAB_STATUSES = {
  proximas:   ['pendiente', 'confirmada'],
  historial:  ['completada'],
  canceladas: ['cancelada', 'en_espera'],
};

// ── Helpers ───────────────────────────────────────────────────
function formatFecha(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric',
    month: 'long', year: 'numeric',
  });
}

function formatHora(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit',
  });
}

function initials(nombre = '') {
  return nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────
export default function ClientPortal() {
  const navigate = useNavigate();

  // ── Formulario de búsqueda ──
  const [searchField, setSearchField] = useState('telefono'); // 'telefono' | 'email'
  const [searchValue, setSearchValue] = useState('');

  // ── Datos obtenidos de la API ──
  const [client,       setClient]       = useState(null);
  const [appointments, setAppointments] = useState([]);

  // ── UI ──
  const [activeTab, setActiveTab]   = useState('proximas');
  const [loading,   setLoading]     = useState(false);
  const [searched,  setSearched]    = useState(false);
  const [error,     setError]       = useState('');

  // ── Modal cancelar ──
  const [modalCancel, setModalCancel] = useState(null); // appt a cancelar
  const [canceling,   setCanceling]   = useState(false);

  // ── Toast ──
  const [toast,     setToast]     = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 3000);
  }, []);

  // ── Buscar cliente y sus citas ────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    setError('');
    setClient(null);
    setAppointments([]);

    try {
      // 1. Buscar cliente por teléfono o email
      const res = await clientsAPI.search(searchValue.trim());

      // El backend devuelve siempre un array — normalizamos por si acaso
      const rawData = res.data;
      const clientes = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.items)
        ? rawData.items
        : rawData
        ? [rawData]
        : [];

      if (clientes.length === 0) {
        setError('No encontramos ningún cliente con ese dato. Verifica e intenta de nuevo.');
        setSearched(true);
        return;
      }

      // Buscar coincidencia exacta primero, luego el primero del array
      const q = searchValue.trim().toLowerCase();
      const exactMatch = clientes.find(c =>
        c.telefono === searchValue.trim() ||
        (c.email && c.email.toLowerCase() === q)
      );
      const foundClient = exactMatch || clientes[0];

      setClient(foundClient);

      // Pedir SOLO las citas de ese cliente
      const apptRes = await appointmentsAPI.getAll({ client_id: foundClient.id });
      const rawAppts = apptRes.data;
      const todasCitas = Array.isArray(rawAppts) ? rawAppts : [];

      // Doble seguridad: filtrar por client_id en frontend
      const soloDelCliente = todasCitas.filter(
        a => a.client_id === foundClient.id || a.client?.id === foundClient.id
      );
      setAppointments(soloDelCliente);
      setSearched(true);
    } catch (err) {
      console.error('Error buscando cliente:', err);
      setError('Ocurrió un error al buscar. Por favor intenta de nuevo.');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Cancelar cita ─────────────────────────────────────────
  const handleCancel = async () => {
    if (!modalCancel) return;
    setCanceling(true);
    try {
      await appointmentsAPI.cancel(modalCancel.id);
      // Actualizar localmente sin refetch
      setAppointments(prev =>
        prev.map(a => a.id === modalCancel.id ? { ...a, estado: 'cancelada' } : a)
      );
      showToast('Cita cancelada correctamente');
      setModalCancel(null);
    } catch (err) {
      showToast(err.userMessage || 'Error al cancelar la cita');
    } finally {
      setCanceling(false);
    }
  };

  // ── Filtrar citas por tab ─────────────────────────────────
  const filteredAppts = appointments.filter(a =>
    TAB_STATUSES[activeTab]?.includes(a.estado)
  );

  const countByTab = (tab) =>
    appointments.filter(a => TAB_STATUSES[tab]?.includes(a.estado)).length;

  // ── Puede cancelar: solo pendiente o confirmada + fecha futura ──
  const canCancel = (appt) => {
    if (!['pendiente', 'confirmada'].includes(appt.estado)) return false;
    return new Date(appt.fecha_inicio) > new Date();
  };

  return (
    <div className="cp-wrap">

      {/* HEADER */}
      <header className="cp-header">
        <a className="cp-logo" href="/">
          <div className="cp-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
              width="18" height="18">
              <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
          </div>
          <span className="cp-logo-text">Entre<span>Manos</span></span>
        </a>

        <div className="cp-header-right">
          <a className="cp-back-btn" href="/">
            <svg width="13" height="13" fill="none" stroke="currentColor"
              strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            Volver al inicio
          </a>
        </div>
      </header>

      {/* HERO + BÚSQUEDA */}
      <div className="cp-hero">
        <div className="cp-hero-tag">Portal del Cliente</div>
        <h1 className="cp-hero-title">Consulta tus citas</h1>
        <p className="cp-hero-sub">
          Busca con tu teléfono o correo para ver y gestionar tus reservas
        </p>

        <div className="cp-search-card">
          <div className="cp-search-title">¿Cómo deseas buscarte?</div>

          {/* Selector de campo */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
            {[['telefono','📱 Teléfono'],['email','✉️ Email']].map(([v,l]) => (
              <button key={v}
                type="button"
                onClick={() => { setSearchField(v); setSearchValue(''); }}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: '8px',
                  border: `1px solid ${searchField === v ? 'var(--pri)' : 'var(--bdr)'}`,
                  background: searchField === v ? 'var(--pri-lt)' : 'transparent',
                  color: searchField === v ? 'var(--pri)' : 'var(--tx2)',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all .15s',
                }}>
                {l}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch}>
            <div className="cp-form-group">
              <label className="cp-form-label">
                {searchField === 'telefono' ? 'Tu número de teléfono' : 'Tu correo electrónico'}
              </label>
              <input
                className="cp-form-input"
                type={searchField === 'email' ? 'email' : 'tel'}
                placeholder={searchField === 'telefono' ? '3001234567' : 'tucorreo@email.com'}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                required
              />
            </div>

            <button className="cp-search-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="cp-spinner" style={{ width:'16px', height:'16px', borderWidth:'2px' }} />
                  Buscando...
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor"
                    strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Buscar mis citas
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RESULTADO */}
      <div className="cp-content">

        {/* Error de búsqueda */}
        {error && searched && !loading && (
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor"
                strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="cp-empty-title">No encontramos tu perfil</div>
            <p className="cp-empty-sub">{error}</p>
            <button className="cp-btn primary" onClick={() => navigate('/booking')}>
              Agendar primera cita
            </button>
          </div>
        )}

        {/* Estado inicial — sin búsqueda aún */}
        {!searched && !loading && (
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor"
                strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="cp-empty-title">Consulta tus reservas</div>
            <p className="cp-empty-sub">
              Ingresa tu teléfono o correo para ver todas tus citas en Entre Manos.
            </p>
          </div>
        )}

        {/* Resultados */}
        {client && !loading && (
          <>
            {/* Info del cliente */}
            <div className="cp-client-header">
              <div className="cp-client-avatar">{initials(client.nombre)}</div>
              <div>
                <div className="cp-client-name">{client.nombre}</div>
                <div className="cp-client-meta">
                  {client.telefono && <span>{client.telefono}</span>}
                  {client.email && client.telefono && <span> · </span>}
                  {client.email && <span>{client.email}</span>}
                  <span style={{ marginLeft:'8px' }}>
                    · {appointments.length} cita{appointments.length !== 1 ? 's' : ''} en total
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="cp-tabs">
              {[
                ['proximas',   'Próximas'],
                ['historial',  'Historial'],
                ['canceladas', 'Canceladas'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`cp-tab ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}>
                  {label}
                  {countByTab(key) > 0 && (
                    <span style={{
                      marginLeft: '6px',
                      background: activeTab === key ? 'var(--pri)' : 'var(--bg2)',
                      color: activeTab === key ? '#fff' : 'var(--tx2)',
                      fontSize: '10px', fontWeight: '700',
                      padding: '1px 6px', borderRadius: '10px',
                    }}>
                      {countByTab(key)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Lista de citas */}
            {filteredAppts.length === 0 ? (
              <div className="cp-empty" style={{ padding:'40px 24px' }}>
                <div className="cp-empty-title" style={{ fontSize:'16px' }}>
                  {activeTab === 'proximas'
                    ? 'Sin citas próximas'
                    : activeTab === 'historial'
                    ? 'Sin citas completadas aún'
                    : 'Sin cancelaciones'}
                </div>
                <p className="cp-empty-sub">
                  {activeTab === 'proximas'
                    ? 'No tienes citas pendientes o confirmadas.'
                    : ''}
                </p>
              </div>
            ) : (
              filteredAppts
                .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
                .map(appt => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    canCancel={canCancel(appt)}
                    onCancel={() => setModalCancel(appt)}
                    onBook={() => navigate('/booking')}
                  />
                ))
            )}

            {/* CTA nueva cita */}
            {activeTab === 'proximas' && (
              <div className="cp-new-booking">
                <div className="cp-new-booking-text">
                  ¿Quieres agendar otra cita?
                </div>
                <button className="cp-btn primary" onClick={() => navigate('/booking')}>
                  Nueva reserva
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL CANCELAR */}
      {modalCancel && (
        <div className="cp-modal-overlay"
          onClick={e => e.target === e.currentTarget && setModalCancel(null)}>
          <div className="cp-modal">
            <div className="cp-modal-header">
              <div className="cp-modal-title">Cancelar cita</div>
              <button className="cp-modal-close" onClick={() => setModalCancel(null)}>✕</button>
            </div>
            <div className="cp-modal-body">
              ¿Estás segura de que deseas cancelar tu cita de{' '}
              <strong>{modalCancel.service?.nombre || 'este servicio'}</strong>{' '}
              el {formatFecha(modalCancel.fecha_inicio)} a las{' '}
              {formatHora(modalCancel.fecha_inicio)}?
              <br /><br />
              <span style={{ color:'var(--err)', fontSize:'12px' }}>
                Esta acción no se puede deshacer. Si pagaste un abono, contáctanos
                para coordinar el reembolso según nuestra política.
              </span>
            </div>
            <div className="cp-modal-footer">
              <button className="cp-btn outline" onClick={() => setModalCancel(null)}>
                Volver
              </button>
              <button className="cp-btn danger" onClick={handleCancel} disabled={canceling}>
                {canceling ? 'Cancelando...' : 'Sí, cancelar cita'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`cp-toast ${toastShow ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}

// ── TARJETA DE CITA ───────────────────────────────────────────
function AppointmentCard({ appt, canCancel, onCancel, onBook }) {
  const saldo = Math.max(
    0,
    Number(appt.precio_total || 0) - Number(appt.abono || 0)
  );

  return (
    <div className="cp-appt-card">
      <div className="cp-appt-top">
        <div>
          <div className="cp-appt-service">
            {appt.service?.nombre || 'Servicio'}
          </div>
          <div className="cp-appt-professional">
            Con {appt.professional?.nombre || 'profesional'}
          </div>
        </div>
        <span className={`cp-badge ${appt.estado}`}>
          {STATUS_LABEL[appt.estado] || appt.estado}
        </span>
      </div>

      {/* Detalles */}
      <div className="cp-appt-details">
        <div className="cp-detail-item">
          <span className="cp-detail-label">Fecha</span>
          <span className="cp-detail-value">{formatFecha(appt.fecha_inicio)}</span>
        </div>
        <div className="cp-detail-item">
          <span className="cp-detail-label">Hora</span>
          <span className="cp-detail-value">
            {formatHora(appt.fecha_inicio)}
            {appt.fecha_fin && ` — ${formatHora(appt.fecha_fin)}`}
          </span>
        </div>
      </div>

      {/* Resumen financiero solo si hay precio */}
      {Number(appt.precio_total) > 0 && (
        <div className="cp-finance">
          <div className="cp-finance-item">
            <span className="cp-finance-label">Total</span>
            <span className="cp-finance-value">
              ${Number(appt.precio_total).toLocaleString('es-CO')}
            </span>
          </div>
          <div className="cp-finance-item">
            <span className="cp-finance-label">Abono pagado</span>
            <span className="cp-finance-value pri">
              ${Number(appt.abono || 0).toLocaleString('es-CO')}
            </span>
          </div>
          {saldo > 0 && (
            <div className="cp-finance-item">
              <span className="cp-finance-label">Saldo pendiente</span>
              <span className="cp-finance-value acc">
                ${saldo.toLocaleString('es-CO')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Notas */}
      {appt.notas && (
        <div style={{
          fontSize: '12px', color: 'var(--tx2)',
          background: 'var(--bg)',
          padding: '8px 12px', borderRadius: '8px',
          marginBottom: '12px', lineHeight: '1.6',
        }}>
          📝 {appt.notas}
        </div>
      )}

      {/* Acciones */}
      <div className="cp-appt-actions">
        {canCancel && (
          <button className="cp-btn danger" onClick={onCancel}>
            Cancelar cita
          </button>
        )}
        {appt.estado === 'completada' && (
          <button className="cp-btn primary" onClick={onBook}>
            Reservar de nuevo
          </button>
        )}
        {appt.estado === 'cancelada' && (
          <button className="cp-btn outline" onClick={onBook}>
            Agendar nueva cita
          </button>
        )}
      </div>
    </div>
  );
}