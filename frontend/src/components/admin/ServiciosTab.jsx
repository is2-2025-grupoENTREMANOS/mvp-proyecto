import React, { useState } from 'react';
import { servicesAPI } from '../../services/api';

export default function ServiciosTab({
  services = [], setServices, loadingServices, showToast
}) {
  const emptyForm = { nombre:'', descripcion:'', duracion:60, precio:0 };

  const [showForm,    setShowForm]    = useState(false);
  const [editSvc,     setEditSvc]     = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [savingId,    setSavingId]    = useState(null);
  const [showInactive,setShowInactive]= useState(false);
  const [form, setForm] = useState(emptyForm);

  const activeServices   = services.filter(s => s.activo !== false);
  const inactiveServices = services.filter(s => s.activo === false);

  const resetForm = () => {
    setForm(emptyForm);
    setEditSvc(null);
    setShowForm(false);
  };

  const openEdit = (s) => {
    setEditSvc(s);
    setForm({
      nombre:      s.nombre      || '',
      descripcion: s.descripcion || '',
      duracion:    s.duracion    || 60,
      precio:      s.precio      || 0,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim())               { showToast('Nombre obligatorio'); return; }
    if (!form.duracion || form.duracion < 5){ showToast('Duración inválida'); return; }
    if (!form.precio || form.precio <= 0)  { showToast('Precio debe ser mayor a 0'); return; }

    setSaving(true);
    try {
      if (editSvc) {
        const res = await servicesAPI.update(editSvc.id, form);
        setServices(prev => prev.map(s => s.id === editSvc.id ? res.data : s));
        showToast('Servicio actualizado');
      } else {
        const res = await servicesAPI.create(form);
        setServices(prev => [...prev, res.data]);
        showToast('Servicio creado');
      }
      resetForm();
    } catch (err) {
      showToast(err.userMessage || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (svc) => {
    setSavingId(svc.id);
    try {
      await servicesAPI.deactivate(svc.id);
      setServices(prev =>
        prev.map(s => s.id === svc.id ? { ...s, activo: false } : s)
      );
      showToast(`${svc.nombre} desactivado`);
    } catch (err) {
      showToast(err.userMessage || 'Error al desactivar');
    } finally {
      setSavingId(null);
    }
  };

  const handleReactivate = async (s) => {
    setSavingId(s.id);
    try {
      const res = await servicesAPI.update(s.id, { activo: true });
      setServices(prev => prev.map(x =>
        x.id === s.id ? res.data : x
      ));
      showToast(`${s.nombre} reactivado`);
    } catch (err) {
      showToast(err.userMessage || 'Error al reactivar');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:'14px', flexWrap:'wrap', gap:'8px' }}>
        <button className="add-btn" style={{ margin:0 }}
          onClick={() => { resetForm(); setShowForm(prev => !prev); }}>
          + Nuevo servicio
        </button>
        {inactiveServices.length > 0 && (
          <button style={{
            padding:'6px 14px', border:'1px solid var(--bdr)',
            background:'var(--bg3)', borderRadius:'8px', fontSize:'12px',
            cursor:'pointer', color:'var(--tx2)', fontFamily:'Inter,sans-serif'
          }} onClick={() => setShowInactive(p => !p)}>
            {showInactive ? 'Ocultar inactivos' : `Ver inactivos (${inactiveServices.length})`}
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{
          background:'var(--bg3)', border:'1px solid var(--bdr)',
          borderRadius:'12px', padding:'20px', marginBottom:'18px'
        }}>
          <div style={{ fontWeight:'600', color:'var(--tx)', marginBottom:'14px', fontSize:'14px' }}>
            {editSvc ? `Editando: ${editSvc.nombre}` : 'Nuevo servicio'}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.nombre}
                placeholder="Ej: Manicure completa"
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Duración (min) *</label>
              <input className="form-input" type="number" min="5" step="5"
                value={form.duracion}
                onChange={e => setForm(p => ({ ...p, duracion: parseInt(e.target.value)||0 }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Precio (COP) *</label>
              <input className="form-input" type="number" min="0" step="1000"
                value={form.precio}
                onChange={e => setForm(p => ({ ...p, precio: parseFloat(e.target.value)||0 }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <input className="form-input" value={form.descripcion}
                placeholder="Descripción corta"
                onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer" style={{ marginTop:'12px', paddingTop:'12px' }}>
            <button className="btn-cancel" onClick={resetForm}>Cancelar</button>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editSvc ? 'Actualizar' : 'Crear servicio'}
            </button>
          </div>
        </div>
      )}

      {loadingServices && (
        <div style={{ textAlign:'center', padding:'32px',
          color:'var(--tx2)', fontSize:'13px' }}>
          Cargando servicios...
        </div>
      )}

      {/* Tarjetas activas */}
      <div className="svc-cards">
        {activeServices.map(s => (
          <div key={s.id} className="svc-card">
            <div className="svc-img">
              {s.imagen_url ? (
                <img src={s.imagen_url} alt={s.nombre}
                  style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <svg width="36" height="36" fill="none" stroke="var(--tx3)"
                  strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              )}
              <div className="svc-img-label">Imagen del servicio</div>
            </div>
            <div className="svc-body">
              <div className="svc-name">{s.nombre}</div>
              {s.descripcion && (
                <div style={{ fontSize:'11px', color:'var(--tx2)',
                  marginBottom:'8px', lineHeight:'1.5' }}>
                  {s.descripcion}
                </div>
              )}
              <div className="svc-meta">
                <span className="svc-price">
                  ${Number(s.precio).toLocaleString('es-CO')}
                </span>
                <span className="svc-dur">⏱ {s.duracion} min</span>
              </div>
              <div className="card-actions">
                <button className="card-btn edit" onClick={() => openEdit(s)}>Editar</button>
                <button className="card-btn del"
                  disabled={savingId === s.id}
                  onClick={() => handleDeactivate(s)}>
                  {savingId === s.id ? '...' : 'Desactivar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inactivos */}
      {showInactive && inactiveServices.length > 0 && (
        <div style={{ marginTop:'20px' }}>
          <div style={{ fontSize:'13px', fontWeight:'600',
            color:'var(--tx2)', marginBottom:'12px' }}>
            Servicios inactivos
          </div>
          <div className="svc-cards">
            {inactiveServices.map(s => (
              <div key={s.id} className="svc-card" style={{ opacity:.55 }}>
                <div className="svc-body">
                  <div className="svc-name">{s.nombre}</div>
                  <div className="svc-meta">
                    <span className="svc-price">
                      ${Number(s.precio).toLocaleString('es-CO')}
                    </span>
                    <span className="svc-dur">⏱ {s.duracion} min</span>
                  </div>
                  <button className="card-btn edit" style={{ width:'100%' }}
                    disabled={savingId === s.id}
                    onClick={() => handleReactivate(s)}>
                    {savingId === s.id ? '...' : 'Reactivar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}