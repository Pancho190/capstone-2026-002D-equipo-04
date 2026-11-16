import { useState, useEffect, lazy, Suspense } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import QRModal from '../components/QRModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const ChartsSection = lazy(() => import('../components/ChartsSection'));
const DetailCharts = lazy(() => import('../components/DetailCharts'));
import ProspectDetailModal from '../components/ProspectDetailModal';

export default function AdminDashboard() {
  const [prospectos, setProspectos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [duplicados, setDuplicados] = useState([]);
  const [filtros, setFiltros] = useState({ periodo: '', desde: '', hasta: '', evento_id: '', tipo: '', mes: '', dia: '' });
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [qrEvento, setQrEvento] = useState(null);
  const [vista, setVista] = useState('actividades');
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const navigate = useNavigate();

  const filteredEventos = eventos.filter((e) => {
    if (filtros.tipo && e.tipo !== filtros.tipo) return false;
    if (filtros.evento_id && e.id !== filtros.evento_id) return false;
    return true;
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/admin/login'); return; }
    cargarDatos();
  }, []);

  const cargarDatos = async (f = filtros) => {
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => { if (v) params.append(k, v); });
      const [prosRes, evRes, dupRes] = await Promise.all([
        api.get(`/prospectos?${params.toString()}`),
        api.get('/eventos'),
        api.get('/prospectos/duplicados')
      ]);
      setProspectos(prosRes.data.data || prosRes.data);
      setEventos(evRes.data);
      setDuplicados(dupRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/admin/login');
    }
  };

  const verProspectos = (evento) => {
    const newFiltros = { ...filtros, evento_id: evento.id };
    setFiltros(newFiltros);
    setActividadSeleccionada(evento);
    setVista('detalle');
    cargarDatos(newFiltros);
  };

  const volverActividades = () => {
    const newFiltros = { ...filtros, evento_id: '' };
    setFiltros(newFiltros);
    setActividadSeleccionada(null);
    setVista('actividades');
    cargarDatos(newFiltros);
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

  const totalInscritos = prospectos.length;
  const totalDuplicados = vista === 'detalle' && actividadSeleccionada
    ? duplicados.filter((d) => d.actividades.some((a) => a.nombre === actividadSeleccionada.nombre)).length
    : duplicados.length;
  const totalExperiencias = filteredEventos.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{ background: 'var(--color-primary)', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Lato, sans-serif' }}>
        <div>
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Admisión Duoc UC, Valparaíso</span>
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Panel de Administración</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem' }}>Nivel: ADMIN</span>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/admin/login'); }} className="ghost" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.5)' }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
        <aside style={{ width: 300, flexShrink: 0 }}>
          <div className="card" style={{ margin: 0, padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Filtros</h3>
            <div className="form-group">
              <label>Periodo de captacion</label>
              <select value={filtros.periodo} onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}>
                <option value="">Todos</option>
                {[2026, 2027, 2028, 2029, 2030].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Desde</label>
              <input type="date" value={filtros.desde} onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Hasta</label>
              <input type="date" value={filtros.hasta} onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Actividad</label>
              <select value={filtros.evento_id} onChange={(e) => setFiltros({ ...filtros, evento_id: e.target.value })}>
                <option value="">Todas</option>
                {eventos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
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
            <div className="form-group">
              <label>Mes</label>
              <select value={filtros.mes} onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}>
                <option value="">Todos</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Día</label>
              <input type="number" min="1" max="31" value={filtros.dia} onChange={(e) => setFiltros({ ...filtros, dia: e.target.value })} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" className="primary" onClick={() => cargarDatos(filtros)} style={{ width: '100%' }}>Filtrar</button>
              <button type="button" className="ghost" onClick={exportarCSV} style={{ width: '100%' }}>Exportar CSV</button>
              <button type="button" className="ghost" onClick={() => { setFiltros({ periodo: '', desde: '', hasta: '', evento_id: '', tipo: '', mes: '', dia: '' }); cargarDatos({ periodo: '', desde: '', hasta: '', evento_id: '', tipo: '', mes: '', dia: '' }); }} style={{ width: '100%', fontSize: '13px', padding: '4px 12px', height: '32px' }}>Limpiar filtros</button>
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#4a5568', fontSize: '0.85rem' }}>
              <p>Espacio para mascota Duco</p>
            </div>
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="primary" onClick={() => { setEditingEvent(null); setShowEventForm(true); }}>
              + Nueva actividad
            </button>
          </div>

          {showEventForm && (
            <EventForm
              evento={editingEvent}
              onSave={() => { setShowEventForm(false); setEditingEvent(null); cargarDatos(); }}
              onCancel={() => { setShowEventForm(false); setEditingEvent(null); }}
            />
          )}

          {showQR && <QRModal evento={qrEvento} onClose={() => { setShowQR(false); setQrEvento(null); }} />}

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div className="card" style={{ flex: 1, minWidth: 180, margin: 0, padding: '1rem', textAlign: 'center', borderLeft: '4px solid #0033a0' }}>
              <p style={{ fontSize: '0.85rem', color: '#4a5568', margin: 0 }}>Total {vista === 'detalle' ? 'en la actividad' : 'inscritos global'}</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#0033a0', margin: 0 }}>{totalInscritos}</p>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 180, margin: 0, padding: '1rem', textAlign: 'center', borderLeft: '4px solid #d32f2f' }}>
              <p style={{ fontSize: '0.85rem', color: '#4a5568', margin: 0 }}>Total duplicados</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#d32f2f', margin: 0 }}>{totalDuplicados}</p>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 180, margin: 0, padding: '1rem', textAlign: 'center', borderLeft: '4px solid #6dd400' }}>
              <p style={{ fontSize: '0.85rem', color: '#4a5568', margin: 0 }}>Experiencias</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#6dd400', margin: 0 }}>{totalExperiencias}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button className={vista === 'actividades' ? 'primary' : 'ghost'} onClick={() => setVista('actividades')}>Actividades</button>
            <button className={vista === 'duplicados' ? 'primary' : 'ghost'} onClick={() => setVista('duplicados')}>Duplicados ({duplicados.length})</button>
          </div>

          {vista === 'actividades' && (
            <>
              <h3 style={{ marginBottom: '0.75rem', color: '#0033a0' }}>Actividades filtradas</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #0033a0' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Nombre</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Tipo</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Fecha inicio</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Inscritos</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Duplicados</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEventos.map((e) => (
                      <tr key={e.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.5rem' }}>{e.nombre}</td>
                        <td style={{ padding: '0.5rem' }}>{e.tipo}</td>
                        <td style={{ padding: '0.5rem' }}>{new Date(e.fecha_inicio).toLocaleDateString()}</td>
                        <td style={{ padding: '0.5rem' }}>{prospectos.filter((p) => p.evento_id === e.id).length}</td>
                        <td style={{ padding: '0.5rem' }}>
                          {prospectos.filter((p) => p.evento_id === e.id && duplicados.some((d) => d.rut === p.rut)).length}
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <button className="ghost" onClick={() => verProspectos(e)} style={{ fontSize: '0.85rem' }} aria-label="Ver prospectos de la actividad">Ver prospectos</button>
                          <button className="ghost" onClick={() => { setEditingEvent(e); setShowEventForm(true); }} style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }} aria-label="Editar actividad">Editar</button>
                          <button className="ghost" onClick={() => { setQrEvento(e); setShowQR(true); }} style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }} aria-label="Generar código QR">QR</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEventos.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#4a5568' }}>No hay actividades.</p>}
              </div>

              <Suspense fallback={<p>Cargando gráficos...</p>}>
                <ChartsSection prospectos={prospectos} />
              </Suspense>
            </>
          )}

          {vista === 'duplicados' && (
            <>
              <h3 style={{ marginBottom: '0.75rem', color: '#0033a0' }}>Prospectos duplicados en actividades</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #0033a0' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">RUT</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Nombre</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Actividades</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Primera captura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicados.map((d) => (
                      <tr key={d.rut} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.5rem' }}>{d.rut}</td>
                        <td style={{ padding: '0.5rem' }}>{d.nombre}</td>
                        <td style={{ padding: '0.5rem' }}>{d.actividades.map((a) => a.nombre).join(', ')}</td>
                        <td style={{ padding: '0.5rem' }}>{new Date(d.primera_captura).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {duplicados.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#4a5568' }}>No hay prospectos duplicados.</p>}
              </div>
            </>
          )}

          {vista === 'detalle' && actividadSeleccionada && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <button className="ghost" onClick={volverActividades}>← Volver al listado de actividades</button>
              </div>
              <h3 style={{ marginBottom: '0.75rem', color: '#0033a0' }}>Inscritos en: {actividadSeleccionada.nombre}</h3>
              <button className="primary" onClick={exportarCSV} style={{ marginBottom: '1rem' }}>Exportar CSV</button>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #0033a0' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">RUT</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Nombre</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Apellido</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Correo</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Teléfono</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }} scope="col">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospectos.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.5rem' }}>{p.rut}</td>
                        <td style={{ padding: '0.5rem' }}>{p.nombre_completo}</td>
                        <td style={{ padding: '0.5rem' }}>{p.apellidos || '-'}</td>
                        <td style={{ padding: '0.5rem' }}>{p.correo || '-'}</td>
                        <td style={{ padding: '0.5rem' }}>{p.telefono || '-'}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <button className="ghost" onClick={() => setSelectedProspect(p)} style={{ fontSize: '0.85rem' }} aria-label="Ver detalle del prospecto">Ver</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {prospectos.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#4a5568' }}>No hay prospectos.</p>}
              </div>
              <Suspense fallback={<p>Cargando gráficos...</p>}>
                <DetailCharts prospectos={prospectos} />
              </Suspense>
            </>
          )}
        </main>
      </div>
      <ProspectDetailModal prospecto={selectedProspect} onClose={() => setSelectedProspect(null)} />
    </div>
  );
}
