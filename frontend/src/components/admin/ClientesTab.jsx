import React, { useState, useEffect } from 'react';
import { clientsAPI } from '../../services/api';

export default function ClientesTab({ showToast }) {
  const [clients,     setClients]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editClient,  setEditClient]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [savingId,    setSavingId]    = useState(null);

  const emptyForm = { nombre:'', telefono:'', email:'', notas:'' };
  const [form, setForm] = useState(emptyForm);

  // ── Cargar clientes ──────────────────────────────────────────
  const fetchClients = () => {
    setLoading(true);
    clientsAPI.getAll()
      .then(res => setClients(res.data))
      .catch(err => showToast(err.userMessage || 'Error cargando clientes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, []);

  // ── Búsqueda reactiva ────────────────────────────────────────
  useEffect(() => {
    if (search.length >= 2) {
      clientsAPI.search(search)
        .then(res => setClients(res.data))
        .catch(() => {});
    } else if (search === '') {
      fetchClients();
    }
  }, [search]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditClient(null);
    setShowForm(false);
  };

  const openEdit = (c) => {
    setEditClient(c);
    setForm({
      nombre:   c.nombre   || '',
      telefono: c.telefono || '',
      email:    c.email    || '',
      notas:    c.notas    || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) { showToast('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      if (editClient) {
        const res = await clientsAPI.update(editClient.id, form);
        setClients(prev => prev.map(c => c.id === editClient.id ? res.data : c));
        showToast('Cliente actualizado');
      } else {
        const res = await clientsAPI.create(form);
        setClients(prev => [res.data, ...prev]);
        showToast('Cliente creado');
      }
      resetForm();
    } catch (err) {
      showToast(err.userMessage || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (c) => {
    setSavingId(c.id);
    try {
      await clientsAPI.deactivate(c.id);
      setClients(prev => prev.map(x =>
        x.id === c.id ? { ...x, activo: false } : x
      ));
      showToast(`${c.nombre} desactivado`);
    } catch (err) {
      showToast(err.userMessage || 'Error al desactivar');
    } finally {
      setSavingId(null);
    }
  };

  const handleBlock = async (c) => {
    setSavingId(c.id);
    try {
      await clientsAPI.block(c.id);
      setClients(prev => prev.map(x =>
        x.id === c.id ? { ...x, bloqueado: true, activo: false } : x
      ));
      showToast(`${c.nombre} bloqueado`);
    } catch (err) {
      showToast(err.userMessage || 'Error al bloquear');
    } finally {
      setSavingId(null);
    }
  };

  const activeClients   = clients.filter(c => c.activo && !c.bloqueado);
  const inactiveClients = clients.filter(c => !c.activo || c.bloqueado);

  return (
    <div>
      {/* Barra superior */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'16px', flexWrap:'wrap' }}>
        <div style={{ flex:1, position:'relative', minWidth:'200px' }}>
          <input
            className="form-input"
            type="text"
            placeholder="Buscar cliente por nombre o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft:'36px' }}
          />
          <svg style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)',
            color:'var(--tx3)' }} width="14" height="14" fill="none"
            stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <button className="add-btn" style={{ margin:0 }}
          onClick={() => { resetForm(); setShowForm(prev => !prev); }}>
          + Nuevo cliente
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{
          background:'var(--bg3)', border:'1px solid var(--bdr)',
          borderRadius:'12px', padding:'20px', marginBottom:'18px'
        }}>
          <div style={{ fontWeight:'600', color:'var(--tx)', marginBottom:'14px', fontSize:'14px' }}>
            {editClient ? `Editando: ${editClient.nombre}` : 'Nuevo cliente'}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.nombre}
                placeholder="Nombre completo"
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" value={form.telefono}
                placeholder="+57 300 000 0000"
                onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email}
                placeholder="cliente@email.com"
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Notas</label>
              <input className="form-input" value={form.notas}
                placeholder="Observaciones, alergias, etc."
                onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer" style={{ marginTop:'12px', paddingTop:'12px' }}>
            <button className="btn-cancel" onClick={resetForm}>Cancelar</button>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editClient ? 'Actualizar' : 'Crear cliente'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign:'center', padding:'32px', color:'var(--tx2)', fontSize:'13px' }}>
          Cargando clientes...
        </div>
      )}

      {!loading && (
        <>
          {/* Clientes activos */}
          <div style={{ background:'var(--bg3)', border:'1px solid var(--bdr)',
            borderRadius:'12px', overflow:'hidden', marginBottom:'16px' }}>
            <div style={{ padding:'12px 18px', borderBottom:'1px solid var(--bdr)',
              fontSize:'13px', fontWeight:'600', color:'var(--tx)',
              display:'flex', justifyContent:'space-between' }}>
              <span>Clientes activos</span>
              <span style={{ color:'var(--tx2)', fontWeight:'400' }}>
                {activeClients.length} registrados
              </span>
            </div>
            <table className="list-table">
              <thead><tr>
                <th>Cliente</th><th>Teléfono</th><th>Email</th>
                <th>Notas</th><th>Acciones</th>
              </tr></thead>
              <tbody>
                {activeClients.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign:'center',
                    padding:'24px', color:'var(--tx2)', fontSize:'13px' }}>
                    Sin clientes activos
                  </td></tr>
                ) : activeClients.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{
                          width:'32px', height:'32px', borderRadius:'50%',
                          background:'var(--pri-lt)', color:'var(--pri)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:'12px', fontWeight:'700', flexShrink:0
                        }}>
                          {c.nombre.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <strong>{c.nombre}</strong>
                      </div>
                    </td>
                    <td style={{ color:'var(--tx2)' }}>{c.telefono || '—'}</td>
                    <td style={{ color:'var(--tx2)' }}>{c.email || '—'}</td>
                    <td style={{ color:'var(--tx2)', fontSize:'12px', maxWidth:'160px',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.notas || '—'}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn" title="Editar"
                          onClick={() => openEdit(c)}>✏️</button>
                        <button className="action-btn" title="Desactivar"
                          disabled={savingId === c.id}
                          onClick={() => handleDeactivate(c)}>
                          {savingId === c.id ? '...' : '🚫'}
                        </button>
                        <button className="action-btn" title="Bloquear"
                          disabled={savingId === c.id}
                          onClick={() => handleBlock(c)}
                          style={{ color:'var(--err)' }}>
                          🔒
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clientes inactivos/bloqueados */}
          {inactiveClients.length > 0 && (
            <div style={{ background:'var(--bg3)', border:'1px solid var(--bdr)',
              borderRadius:'12px', overflow:'hidden' }}>
              <div style={{ padding:'12px 18px', borderBottom:'1px solid var(--bdr)',
                fontSize:'13px', fontWeight:'600', color:'var(--tx2)' }}>
                Inactivos / Bloqueados ({inactiveClients.length})
              </div>
              <table className="list-table">
                <thead><tr>
                  <th>Cliente</th><th>Teléfono</th><th>Estado</th>
                </tr></thead>
                <tbody>
                  {inactiveClients.map(c => (
                    <tr key={c.id} style={{ opacity:.6 }}>
                      <td><strong>{c.nombre}</strong></td>
                      <td>{c.telefono || '—'}</td>
                      <td>
                        <span className={`status-badge ${c.bloqueado ? 'canc' : 'done'}`}>
                          {c.bloqueado ? 'Bloqueado' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}