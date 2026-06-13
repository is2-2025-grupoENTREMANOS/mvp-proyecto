import React, { useState } from 'react';
import { professionalsAPI, authAPI } from '../../services/api';

const COLORS = ['#8B5CF6','#EC4899','#06B6D4','#10B981','#F59E0B','#EF4444'];

export default function ProfesionalesTab({
  professionals = [], setProfessionals, loadingProfs, showToast
}) {
  const emptyForm = { nombre:'', especialidad:'', telefono:'', email:'', descripcion:'' };

  const [showForm,   setShowForm]   = useState(false);
  const [editProf,   setEditProf]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [savingId,   setSavingId]   = useState(null);
  const [resetModal, setResetModal] = useState(null);
  const [newPass,    setNewPass]    = useState('');
  const [confPass,   setConfPass]   = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Mostrar inactivos
  const [showInactive, setShowInactive] = useState(false);
  const activeProfs   = professionals.filter(p => p.activo !== false);
  const inactiveProfs = professionals.filter(p => p.activo === false);

  const resetForm = () => {
    setForm(emptyForm);
    setEditProf(null);
    setShowForm(false);
  };

  const openEdit = (p) => {
    setEditProf(p);
    setForm({
      nombre:       p.nombre       || '',
      especialidad: p.especialidad || '',
      telefono:     p.telefono     || '',
      email:        p.email        || '',
      descripcion:  p.descripcion  || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) { showToast('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      if (editProf) {
        const res = await professionalsAPI.update(editProf.id, form);
        setProfessionals(prev =>
          prev.map(p => p.id === editProf.id
            ? { ...p, ...res.data }
            : p
          )
        );
        showToast('Profesional actualizado');
      } else {
        const res = await professionalsAPI.create(form);
        setProfessionals(prev => [
          ...prev,
          { ...res.data, on: true, color: COLORS[prev.length % COLORS.length] }
        ]);
        showToast('Profesional creado');
      }
      resetForm();
    } catch (err) {
      showToast(err.userMessage || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (prof) => {
    setSavingId(prof.id);
    try {
      await professionalsAPI.deactivate(prof.id);
      // Solo cambia activo=false, NO filtra del array
      setProfessionals(prev =>
        prev.map(p => p.id === prof.id ? { ...p, activo: false } : p)
      );
      showToast(`${prof.nombre} desactivado`);
    } catch (err) {
      showToast(err.userMessage || 'Error al desactivar');
    } finally {
      setSavingId(null);
    }
  };

  const handleReactivate = async (p) => {
    setSavingId(p.id);
    try {
      const res = await professionalsAPI.update(p.id, { activo: true });
      setProfessionals(prev =>
        prev.map(x => x.id === p.id ? { ...x, activo: true } : x)
      );
      showToast(`${p.nombre} reactivado`);
    } catch (err) {
      showToast(err.userMessage || 'Error al reactivar');
    } finally {
      setSavingId(null);
    }
  };

  const handleResetPassword = async () => {
    if (!newPass.trim())       { showToast('Ingresa la nueva contraseña'); return; }
    if (newPass.length < 6)    { showToast('Mínimo 6 caracteres'); return; }
    if (newPass !== confPass)  { showToast('Las contraseñas no coinciden'); return; }
    if (!resetModal?.user_id)  {
      showToast('Este profesional no tiene cuenta de usuario vinculada');
      return;
    }
    setSavingPass(true);
    try {
      await authAPI.resetPassword(resetModal.user_id, newPass);
      showToast(`Contraseña de ${resetModal.nombre} actualizada`);
      setResetModal(null);
      setNewPass(''); setConfPass('');
    } catch (err) {
      showToast(err.userMessage || 'Error al actualizar contraseña');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:'14px', flexWrap:'wrap', gap:'8px' }}>
        <button className="add-btn" style={{ margin:0 }}
          onClick={() => { resetForm(); setShowForm(prev => !prev); }}>
          + Nuevo profesional
        </button>
        {inactiveProfs.length > 0 && (
          <button style={{
            padding:'6px 14px', border:'1px solid var(--bdr)',
            background:'var(--bg3)', borderRadius:'8px', fontSize:'12px',
            cursor:'pointer', color:'var(--tx2)', fontFamily:'Inter,sans-serif'
          }} onClick={() => setShowInactive(p => !p)}>
            {showInactive ? 'Ocultar inactivos' : `Ver inactivos (${inactiveProfs.length})`}
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
            {editProf ? `Editando: ${editProf.nombre}` : 'Nuevo profesional'}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.nombre}
                placeholder="Nombre completo"
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Especialidad</label>
              <input className="form-input" value={form.especialidad}
                placeholder="Ej: Esteticista"
                onChange={e => setForm(p => ({ ...p, especialidad: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" value={form.telefono}
                onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-input" rows="2" style={{ resize:'none' }}
              value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
          </div>
          <div className="modal-footer" style={{ marginTop:'12px', paddingTop:'12px' }}>
            <button className="btn-cancel" onClick={resetForm}>Cancelar</button>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editProf ? 'Actualizar' : 'Crear profesional'}
            </button>
          </div>
        </div>
      )}

      {loadingProfs && (
        <div style={{ textAlign:'center', padding:'32px',
          color:'var(--tx2)', fontSize:'13px' }}>
          Cargando profesionales...
        </div>
      )}

      {/* Tarjetas activos */}
      <div className="prof-cards">
        {activeProfs.map((p, i) => (
          <div key={p.id || i} className="prof-card">
            <div className="prof-card-avatar"
              style={{ background: p.color || COLORS[i % COLORS.length] }}>
              {(p.nombre || 'P').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div className="prof-card-name">{p.nombre}</div>
            <div className="prof-card-role">{p.especialidad || 'Especialista'}</div>
            <div className="toggle-wrap">
              <div style={{
                width:'8px', height:'8px', borderRadius:'50%', background:'#4CAF50'
              }} />
              <span className="toggle-label">Activo</span>
            </div>
            <div className="card-actions" style={{ flexDirection:'column', gap:'6px' }}>
              <div style={{ display:'flex', gap:'6px' }}>
                <button className="card-btn edit" onClick={() => openEdit(p)}>Editar</button>
                <button className="card-btn del"
                  disabled={savingId === p.id}
                  onClick={() => handleDeactivate(p)}>
                  {savingId === p.id ? '...' : 'Desactivar'}
                </button>
              </div>
              {p.user_id && (
                <button
                  onClick={() => { setResetModal(p); setNewPass(''); setConfPass(''); }}
                  style={{
                    padding:'5px 10px', borderRadius:'7px',
                    border:'1px solid var(--acc)', background:'var(--acc-lt)',
                    color:'var(--acc)', fontSize:'11px', cursor:'pointer',
                    fontFamily:'Inter,sans-serif', width:'100%'
                  }}>
                  Restablecer contraseña
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Inactivos */}
      {showInactive && inactiveProfs.length > 0 && (
        <div style={{ marginTop:'20px' }}>
          <div style={{ fontSize:'13px', fontWeight:'600',
            color:'var(--tx2)', marginBottom:'12px' }}>
            Profesionales inactivos
          </div>
          <div className="prof-cards">
            {inactiveProfs.map((p, i) => (
              <div key={p.id || i} className="prof-card" style={{ opacity:.6 }}>
                <div className="prof-card-avatar"
                  style={{ background: p.color || COLORS[i % COLORS.length] }}>
                  {(p.nombre || 'P').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="prof-card-name">{p.nombre}</div>
                <div className="prof-card-role">{p.especialidad || 'Especialista'}</div>
                <div className="toggle-wrap">
                  <div style={{
                    width:'8px', height:'8px', borderRadius:'50%', background:'var(--tx3)'
                  }} />
                  <span className="toggle-label">Inactivo</span>
                </div>
                <button className="card-btn edit" style={{ width:'100%' }}
                  disabled={savingId === p.id}
                  onClick={() => handleReactivate(p)}>
                  {savingId === p.id ? '...' : 'Reactivar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal reset password */}
      {resetModal && (
        <div className="modal-overlay open"
          onClick={e => e.target === e.currentTarget && setResetModal(null)}>
          <div className="modal" style={{ maxWidth:'400px' }}>
            <div className="modal-header">
              <div className="modal-title">Restablecer contraseña</div>
              <button className="modal-close" onClick={() => setResetModal(null)}>✕</button>
            </div>
            <p style={{ fontSize:'13px', color:'var(--tx2)', marginBottom:'16px' }}>
              Nueva contraseña para <strong>{resetModal.nombre}</strong>.
              No puedes ver la actual.
            </p>
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <input className="form-input" type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPass} onChange={e => setNewPass(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar contraseña</label>
              <input className="form-input" type="password"
                placeholder="Repite la contraseña"
                value={confPass} onChange={e => setConfPass(e.target.value)} />
            </div>
            {newPass && confPass && newPass !== confPass && (
              <div style={{ fontSize:'12px', color:'var(--err)',
                marginBottom:'12px', padding:'8px 12px',
                background:'var(--err-lt)', borderRadius:'8px' }}>
                Las contraseñas no coinciden
              </div>
            )}
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setResetModal(null)}>Cancelar</button>
              <button className="btn-save"
                disabled={savingPass || !newPass || newPass !== confPass}
                onClick={handleResetPassword}>
                {savingPass ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}