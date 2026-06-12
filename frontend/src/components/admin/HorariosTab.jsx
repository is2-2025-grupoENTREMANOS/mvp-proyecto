import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';

export default function HorariosTab({ businessConfig, setBusinessConfig, showToast }) {
  const [local,  setLocal]  = useState(businessConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocal(businessConfig); }, [businessConfig]);

  const handleSave = async () => {
    if (!local.apertura || !local.cierre) {
      showToast('Completa los horarios'); return;
    }
    if (local.apertura >= local.cierre) {
      showToast('La apertura debe ser antes del cierre'); return;
    }
    setSaving(true);
    try {
      const res = await settingsAPI.updateBusiness({
        opening_time:            local.apertura,
        closing_time:            local.cierre,
        slot_duration:           parseInt(local.slot_duration)  || 60,
        min_advance_hours:       parseInt(local.min_advance_hours) || 2,
        minimum_deposit_percent: parseFloat(local.abono_minimo) || 50,
      });
      setBusinessConfig({
        apertura:          res.data.opening_time,
        cierre:            res.data.closing_time,
        slot_duration:     res.data.slot_duration,
        abono_minimo:      parseFloat(res.data.minimum_deposit_percent),
        min_advance_hours: res.data.min_advance_hours,
      });
      showToast('Configuración guardada — agenda actualizada');
    } catch (err) {
      showToast(err.userMessage || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wa-card">
      <div className="horario-title">Configuración del negocio</div>

      <div className="form-row" style={{ marginBottom:'14px' }}>
        <div className="form-group">
          <label className="form-label">Apertura</label>
          <input className="form-input" type="time"
            value={local.apertura || ''}
            onChange={e => setLocal(p => ({ ...p, apertura: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Cierre</label>
          <input className="form-input" type="time"
            value={local.cierre || ''}
            onChange={e => setLocal(p => ({ ...p, cierre: e.target.value }))} />
        </div>
      </div>

      <div className="form-row" style={{ marginBottom:'14px' }}>
        <div className="form-group">
          <label className="form-label">Duración de slot (min)</label>
          <input className="form-input" type="number" min="15" max="120" step="15"
            value={local.slot_duration || 60}
            onChange={e => setLocal(p => ({ ...p, slot_duration: e.target.value }))} />
          <div style={{ fontSize:'11px', color:'var(--tx3)', marginTop:'4px' }}>
            Cada cuántos minutos aparece un slot en la agenda
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Anticipación mínima (horas)</label>
          <input className="form-input" type="number" min="0"
            value={local.min_advance_hours || 2}
            onChange={e => setLocal(p => ({ ...p, min_advance_hours: e.target.value }))} />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom:'20px' }}>
        <label className="form-label">Abono mínimo requerido (%)</label>
        <input className="form-input" type="number" min="0" max="100"
          value={local.abono_minimo || 50}
          onChange={e => setLocal(p => ({ ...p, abono_minimo: e.target.value }))} />
        <div style={{ fontSize:'11px', color:'var(--tx3)', marginTop:'4px' }}>
          Afecta BookingPage, modal de nueva cita y validaciones
        </div>
      </div>

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  );
}