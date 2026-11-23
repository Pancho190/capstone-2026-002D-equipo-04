import { useState, useEffect, lazy, Suspense } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import QRModal from '../components/QRModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const ChartsSection = lazy(() => import('../components/ChartsSection'));
const DetailCharts = lazy(() => import('../components/DetailCharts'));
import ProspectDetailModal from '../components/ProspectDetailModal';
import DuocMascot from '../components/DuocMascot';
import { formatDateCL } from '../utils';

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
  const [captadores, setCaptadores] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEvento, setAssignEvento] = useState(null);
  const [selectedCaptadorId, setSelectedCaptadorId] = useState('');
  const [assignedCaptadores, setAssignedCaptadores] = useState({});
  const navigate = useNavigate();

  const filteredEventos = eventos.filter((e) => {
    if (filtros.tipo && e.tipo !== filtros.tipo) return false;
    if (filtros.evento_id && e.id !== filtros.evento_id) return false;
    return true;
  });

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) { navigate('/admin/login'); return; }
    cargarDatos();
  }, []);

  const cargarDatos = async (f = filtros) => {
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => { if (v) params.append(k, v); });
      const [prosRes, evRes, dupRes, capRes] = await Promise.all([
        api.get(`/prospectos?${params.toString()}`),
        api.get('/eventos'),
        api.get('/prospectos/duplicados'),
        api.get('/auth/usuarios')
      ]);
      setProspectos(prosRes.data.data || prosRes.data);
      setEventos(evRes.data);
      setDuplicados(dupRes.data);
      setCaptadores(capRes.data.filter((u) => u.rol === 'CAPTADOR' || u.rol === 'Anfitrion'));
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

  const abrirAsignar = async (evento) => {
    setAssignEvento(evento);
    setShowAssignModal(true);
    setSelectedCaptadorId('');
    try {
      const res = await api.get(`/eventos/${evento.id}/captadores`);
      setAssignedCaptadores((prev) => ({ ...prev, [evento.id]: res.data }));
    } catch (err) {
      setAssignedCaptadores((prev) => ({ ...prev, [evento.id]: [] }));
    }
  };

  const asignarCaptador = async () => {
    if (!selectedCaptadorId || !assignEvento) return;
    try {
      await api.post(`/eventos/${assignEvento.id}/asignar`, { usuario_id: selectedCaptadorId });
      const res = await api.get(`/eventos/${assignEvento.id}/captadores`);
      setAssignedCaptadores((prev) => ({ ...prev, [assignEvento.id]: res.data }));
      setSelectedCaptadorId('');
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al asignar captador');
    }
  };

  const desasignarCaptador = async (eventoId, userId) => {
    try {
      await api.delete(`/eventos/${eventoId}/asignar/${userId}`);
      const res = await api.get(`/eventos/${eventoId}/captadores`);
      setAssignedCaptadores((prev) => ({ ...prev, [eventoId]: res.data }));
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al desasignar captador');
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

  const totalInscritos = prospectos.length;
  const totalDuplicados = vista === 'detalle' && actividadSeleccionada
    ? duplicados.filter((d) => d.actividades.some((a) => a.nombre === actividadSeleccionada.nombre)).length
    : duplicados.length;
  const totalExperiencias = filteredEventos.length;

  return (
    <div style={{ minHeight: '100vh', background: '#EEEEEE', fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <header className="admin-header" style={{ background: '#ffffff', borderBottom: '1px solid #CCCCCC', boxShadow: '0 1px 3px rgba(10,36,69,0.04)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: '#1A1A1A' }}>Resultados de actividades</h1>
          <span style={{ fontSize: '0.8rem', color: '#666666' }}>Consulta las actividades y accede a sus prospectos.</span>
        </div>
        <div className="admin-header-actions">
          <button onClick={() => { sessionStorage.removeItem('token'); navigate('/admin/login'); }} className="ghost" style={{ color: '#1A1A1A', border: '1px solid #CCCCCC', background: '#ffffff', height: '36px', fontSize: '0.85rem', padding: '0 1rem' }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div style={{ margin: 0, padding: '1.25rem', background: '#ffffff', border: '1px solid #CCCCCC', borderRadius: '12px', boxShadow: '0 3px 6px rgba(10,36,69,0.04)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1A1A1A', fontWeight: 600 }}>Filtros</h3>
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
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <DuocMascot size={80} floating={false} />
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
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => { setShowEventForm(false); setEditingEvent(null); }}>
              <div onClick={(e) => e.stopPropagation()}>
                <EventForm
                  evento={editingEvent}
                  onSave={() => { setShowEventForm(false); setEditingEvent(null); cargarDatos(); }}
                  onCancel={() => { setShowEventForm(false); setEditingEvent(null); }}
                />
              </div>
            </div>
          )}

          {showQR && <QRModal evento={qrEvento} onClose={() => { setShowQR(false); setQrEvento(null); }} />}

          {showAssignModal && assignEvento && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => { setShowAssignModal(false); setAssignEvento(null); }}>
              <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '4px', padding: '1.5rem', maxWidth: 480, width: '100%', boxShadow: '0 4px 24px rgba(26,26,26,0.12)' }}>
                <h3 style={{ color: '#1A1A1A', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>Asignar captador a: {assignEvento.nombre}</h3>

                {/* Captadores asignados */}
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '0.5rem', fontWeight: 600 }}>Captadores asignados:</p>
                  {(assignedCaptadores[assignEvento.id] || []).length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#666666', fontStyle: 'italic' }}>Ninguno asignado</p>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {(assignedCaptadores[assignEvento.id] || []).map((c) => (
                        <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#EEEEEE', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.85rem' }}>
                          {c.nombre_completo}
                          <button type="button" onClick={() => desasignarCaptador(assignEvento.id, c.id)} style={{ background: 'transparent', border: 'none', color: '#D50032', cursor: 'pointer', fontSize: '0.9rem', padding: 0, lineHeight: 1 }} aria-label={`Desasignar ${c.nombre_completo}`}>✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selector de captador */}
                <div className="form-group">
                  <label>Seleccionar captador</label>
                  <select value={selectedCaptadorId} onChange={(e) => setSelectedCaptadorId(e.target.value)}>
                    <option value="">Seleccione un captador</option>
                    {captadores
                      .filter((c) => !(assignedCaptadores[assignEvento.id] || []).some((a) => a.id === c.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre_completo} ({c.correo})</option>
                      ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="ghost" onClick={() => { setShowAssignModal(false); setAssignEvento(null); }} style={{ height: '36px', fontSize: '0.85rem', padding: '0 1rem' }}>Cerrar</button>
                  <button type="button" className="primary" onClick={asignarCaptador} disabled={!selectedCaptadorId} style={{ height: '36px', fontSize: '0.85rem', padding: '0 1rem' }}>Asignar</button>
                </div>
              </div>
            </div>
          )}

          <div className="admin-kpi-grid">
            <div className="admin-kpi-card" style={{ background: '#ffffff', border: '1px solid #CCCCCC', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 3px 6px rgba(10,36,69,0.04)', position: 'relative' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#666666', margin: 0 }}>Total {vista === 'detalle' ? 'en la actividad' : 'inscritos global'}</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', margin: '0.5rem 0 0.25rem 0' }}>{totalInscritos}</p>
              <p style={{ fontSize: '0.7rem', color: '#666666', margin: 0 }}>En todas las actividades</p>
              <div style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', width: '44px', height: '44px', borderRadius: '11px', background: '#EEEEEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A1A1A' }}>U</span>
              </div>
            </div>
            <div className="admin-kpi-card" style={{ background: '#ffffff', border: '1px solid #CCCCCC', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 3px 6px rgba(10,36,69,0.04)', position: 'relative' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#666666', margin: 0 }}>Total duplicados</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', margin: '0.5rem 0 0.25rem 0' }}>{totalDuplicados}</p>
              <p style={{ fontSize: '0.7rem', color: '#666666', margin: 0 }}>En todas las actividades</p>
              <div style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', width: '44px', height: '44px', borderRadius: '11px', background: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E87722' }}>D</span>
              </div>
            </div>
            <div className="admin-kpi-card" style={{ background: '#ffffff', border: '1px solid #CCCCCC', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 3px 6px rgba(10,36,69,0.04)', position: 'relative' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#666666', margin: 0 }}>Experiencias</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', margin: '0.5rem 0 0.25rem 0' }}>{totalExperiencias}</p>
              <p style={{ fontSize: '0.7rem', color: '#666666', margin: 0 }}>Experiencias registradas</p>
              <div style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', width: '44px', height: '44px', borderRadius: '11px', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#43B02A' }}>E</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button className={vista === 'actividades' ? 'primary' : 'ghost'} onClick={() => setVista('actividades')}>Actividades</button>
            <button className={vista === 'duplicados' ? 'primary' : 'ghost'} onClick={() => setVista('duplicados')}>Duplicados ({duplicados.length})</button>
          </div>

          {vista === 'actividades' && (
            <>
              <h3 style={{ marginBottom: '0.75rem', color: '#1A1A1A' }}>Actividades filtradas</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #CCCCCC', background: '#EEEEEE' }}>
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
                        <td style={{ padding: '0.5rem' }}>{formatDateCL(e.fecha_inicio)}</td>
                        <td style={{ padding: '0.5rem' }}>{prospectos.filter((p) => p.evento_id === e.id).length}</td>
                        <td style={{ padding: '0.5rem' }}>
                          {prospectos.filter((p) => p.evento_id === e.id && duplicados.some((d) => d.rut === p.rut)).length}
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <button className="ghost" onClick={() => verProspectos(e)} style={{ fontSize: '0.85rem' }} aria-label="Ver prospectos de la actividad">Ver prospectos</button>
                          <button className="ghost" onClick={() => { setEditingEvent(e); setShowEventForm(true); }} style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }} aria-label="Editar actividad">Editar</button>
                          <button className="ghost" onClick={() => { setQrEvento(e); setShowQR(true); }} style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }} aria-label="Generar código QR">QR</button>
                          <button className="ghost" onClick={() => abrirAsignar(e)} style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }} aria-label="Asignar captador a la actividad">Asignar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEventos.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#666666' }}>No hay actividades.</p>}
              </div>

              <Suspense fallback={<p>Cargando gráficos...</p>}>
                <ChartsSection prospectos={prospectos} />
              </Suspense>
            </>
          )}

          {vista === 'duplicados' && (
            <>
              <h3 style={{ marginBottom: '0.75rem', color: '#1A1A1A' }}>Prospectos duplicados en actividades</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #CCCCCC', background: '#EEEEEE' }}>
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
                        <td style={{ padding: '0.5rem' }}>{formatDateCL(d.primera_captura)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {duplicados.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#666666' }}>No hay prospectos duplicados.</p>}
              </div>
            </>
          )}

          {vista === 'detalle' && actividadSeleccionada && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <button className="ghost" onClick={volverActividades}>← Volver al listado de actividades</button>
              </div>
              <h3 style={{ marginBottom: '0.75rem', color: '#1A1A1A' }}>Inscritos en: {actividadSeleccionada.nombre}</h3>
              <button className="primary" onClick={exportarCSV} style={{ marginBottom: '1rem' }}>Exportar CSV</button>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #CCCCCC', background: '#EEEEEE' }}>
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
                {prospectos.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#666666' }}>No hay prospectos.</p>}
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
