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
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <header className="admin-header" style={{ background: '#ffffff', borderBottom: '1px solid #e4eaf1', boxShadow: '0 1px 3px rgba(10,36,69,0.04)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: '#172b46' }}>Resultados de actividades</h1>
          <span style={{ fontSize: '0.8rem', color: '#63748a' }}>Consulta las actividades y accede a sus prospectos.</span>
        </div>
        <div className="admin-header-actions">
          <button onClick={() => { localStorage.removeItem('token'); navigate('/admin/login'); }} className="ghost" style={{ color: '#172b46', border: '1px solid #e4eaf1', background: '#ffffff', height: '36px', fontSize: '0.85rem', padding: '0 1rem' }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div style={{ margin: 0, padding: '1.25rem', background: '#ffffff', border: '1px solid #e4eaf1', borderRadius: '12px', boxShadow: '0 3px 6px rgba(10,36,69,0.04)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#172b46', fontWeight: 600 }}>Filtros</h3>
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
            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#63748a', fontSize: '0.85rem' }}>
              <p>Espacio para mascota Duco</p>
            </div>
          </div>
        </aside>

        <main className="admin-main">
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

          <div className="admin-kpi-grid">
            <div className="admin-kpi-card" style={{ background: '#ffffff', border: '1px solid #e4eaf1', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 3px 6px rgba(10,36,69,0.04)', position: 'relative' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#63748a', margin: 0 }}>Total {vista === 'detalle' ? 'en la actividad' : 'inscritos global'}</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#172b46', margin: '0.5rem 0 0.25rem 0' }}>{totalInscritos}</p>
              <p style={{ fontSize: '0.7rem', color: '#63748a', margin: 0 }}>En todas las actividades</p>
              <div style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', width: '44px', height: '44px', borderRadius: '11px', background: '#eaf1fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1454a0' }}>U</span>
              </div>
            </div>
            <div className="admin-kpi-card" style={{ background: '#ffffff', border: '1px solid #e4eaf1', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 3px 6px rgba(10,36,69,0.04)', position: 'relative' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#63748a', margin: 0 }}>Total duplicados</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#172b46', margin: '0.5rem 0 0.25rem 0' }}>{totalDuplicados}</p>
              <p style={{ fontSize: '0.7rem', color: '#63748a', margin: 0 }}>En todas las actividades</p>
              <div style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', width: '44px', height: '44px', borderRadius: '11px', background: '#fff5dd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#b7791f' }}>D</span>
              </div>
            </div>
            <div className="admin-kpi-card" style={{ background: '#ffffff', border: '1px solid #e4eaf1', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 3px 6px rgba(10,36,69,0.04)', position: 'relative' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#63748a', margin: 0 }}>Experiencias</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#172b46', margin: '0.5rem 0 0.25rem 0' }}>{totalExperiencias}</p>
              <p style={{ fontSize: '0.7rem', color: '#63748a', margin: 0 }}>Experiencias registradas</p>
              <div style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', width: '44px', height: '44px', borderRadius: '11px', background: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#276749' }}>E</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button className={vista === 'actividades' ? 'primary' : 'ghost'} onClick={() => setVista('actividades')}>Actividades</button>
            <button className={vista === 'duplicados' ? 'primary' : 'ghost'} onClick={() => setVista('duplicados')}>Duplicados ({duplicados.length})</button>
          </div>

          {vista === 'actividades' && (
            <>
              <h3 style={{ marginBottom: '0.75rem', color: '#172b46' }}>Actividades filtradas</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e4eaf1', background: '#f2f5f9' }}>
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
                {filteredEventos.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#63748a' }}>No hay actividades.</p>}
              </div>

              <Suspense fallback={<p>Cargando gráficos...</p>}>
                <ChartsSection prospectos={prospectos} />
              </Suspense>
            </>
          )}

          {vista === 'duplicados' && (
            <>
              <h3 style={{ marginBottom: '0.75rem', color: '#172b46' }}>Prospectos duplicados en actividades</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e4eaf1', background: '#f2f5f9' }}>
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
                {duplicados.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#63748a' }}>No hay prospectos duplicados.</p>}
              </div>
            </>
          )}

          {vista === 'detalle' && actividadSeleccionada && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <button className="ghost" onClick={volverActividades}>← Volver al listado de actividades</button>
              </div>
              <h3 style={{ marginBottom: '0.75rem', color: '#172b46' }}>Inscritos en: {actividadSeleccionada.nombre}</h3>
              <button className="primary" onClick={exportarCSV} style={{ marginBottom: '1rem' }}>Exportar CSV</button>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e4eaf1', background: '#f2f5f9' }}>
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
                {prospectos.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#63748a' }}>No hay prospectos.</p>}
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
