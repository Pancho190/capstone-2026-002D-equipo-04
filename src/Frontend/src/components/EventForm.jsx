import { useState, useEffect, useRef } from 'react';
import api from '../api';

const TIPOS = ['Japan', 'Cafeína', 'Sobremesa', 'Asesoría vocacional', 'Ventana vocacional'];

export default function EventForm({ evento, onSave, onCancel }) {
  const modalRef = useRef(null);
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [tipo, setTipo] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    modal.addEventListener('keydown', handleKeyDown);

    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    modal.addEventListener('keydown', trap);

    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
      modal.removeEventListener('keydown', trap);
    };
  }, [onCancel]);

  useEffect(() => {
    if (evento) {
      setNombre(evento.nombre || '');
      setFechaInicio(evento.fecha_inicio?.slice(0, 16) || '');
      setFechaFin(evento.fecha_fin?.slice(0, 16) || '');
      setUbicacion(evento.ubicacion || '');
      setTipo(evento.tipo || '');
    }
  }, [evento]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (evento) {
        await api.put(`/eventos/${evento.id}`, { nombre, fecha_inicio: fechaInicio, fecha_fin: fechaFin, ubicacion, tipo });
      } else {
        await api.post('/eventos', { nombre, fecha_inicio: fechaInicio, fecha_fin: fechaFin, ubicacion, tipo });
      }
      onSave();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error al guardar');
    }
  };

  return (
    <div ref={modalRef} className="card" style={{ maxWidth: 600, maxHeight: '85vh', overflowY: 'auto' }} tabIndex={-1}>
      <h2>{evento ? 'Editar actividad' : 'Nueva actividad'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Fecha inicio</label>
            <input type="datetime-local" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
          </div>
          <div className="form-group col-md-6">
            <label>Fecha fin</label>
            <input type="datetime-local" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>Ubicación</label>
          <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
            <option value="">Seleccione tipo</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {msg && <p className="msg error">{msg}</p>}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="submit" className="primary">Guardar</button>
          <button type="button" className="ghost" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
