import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [prospectos, setProspectos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [filtros, setFiltros] = useState({ desde: '', hasta: '', evento_id: '', tipo: '', mes: '', dia: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/admin/login'); return; }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([k, v]) => { if (v) params.append(k, v); });
      const [prosRes, evRes] = await Promise.all([
        api.get(`/prospectos?${params.toString()}`),
        api.get('/eventos')
      ]);
      setProspectos(prosRes.data.data || prosRes.data);
      setEventos(evRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/admin/login');
    }
  };

  const exportarCSV = async () => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => { if (v) params.append(k, v); });
    const res = await api.get(`/prospectos/export?${params.toString()}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prospectos.csv';
    a.click();
  };

  return (
    <div className="card">
      <h2>Panel de Administración</h2>
      <button onClick={() => { localStorage.removeItem('token'); navigate('/admin/login'); }} className="ghost" style={{ marginBottom: '1rem' }}>
        Cerrar sesión
      </button>

      <div className="form-row">
        <div className="form-group col-md-3">
          <label>Desde</label>
          <input type="date" value={filtros.desde} onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })} />
        </div>
        <div className="form-group col-md-3">
          <label>Hasta</label>
          <input type="date" value={filtros.hasta} onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })} />
        </div>
        <div className="form-group col-md-3">
          <label>Actividad</label>
          <select value={filtros.evento_id} onChange={(e) => setFiltros({ ...filtros, evento_id: e.target.value })}>
            <option value="">Todas</option>
            {eventos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>
        <div className="form-group col-md-3">
          <label>Tipo</label>
          <select value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
            <option value="">Todos</option>
            <option value="Japan">Japan</option>
            <option value="Cafeína">Cafeína</option>
            <option value="Sobremesa">Sobremesa</option>
            <option value="Asesoría vocacional">Asesoría vocacional</option>
            <option value="Ventana vocacional">Ventana vocacional</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group col-md-3">
          <label>Mes</label>
          <select value={filtros.mes} onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}>
            <option value="">Todos</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="form-group col-md-3">
          <label>Día</label>
          <input type="number" min="1" max="31" value={filtros.dia} onChange={(e) => setFiltros({ ...filtros, dia: e.target.value })} />
        </div>
        <div className="form-group col-md-6" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          <button type="button" className="primary" onClick={cargarDatos}>Filtrar</button>
          <button type="button" className="ghost" onClick={exportarCSV}>Exportar CSV</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #0033a0' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>RUT</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actividad</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {prospectos.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem' }}>{p.rut}</td>
                <td style={{ padding: '0.5rem' }}>{p.nombre_completo}</td>
                <td style={{ padding: '0.5rem' }}>{p.evento?.nombre || '-'}</td>
                <td style={{ padding: '0.5rem' }}>{new Date(p.fecha_captura).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {prospectos.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#4a5568' }}>No hay prospectos.</p>}
      </div>
    </div>
  );
}
