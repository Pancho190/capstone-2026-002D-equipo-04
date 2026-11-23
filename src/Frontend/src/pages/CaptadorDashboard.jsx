import { useState, useEffect, lazy, Suspense } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const DetailCharts = lazy(() => import('../components/DetailCharts'));
import ProspectDetailModal from '../components/ProspectDetailModal';
import { formatDateCL } from '../utils';

export default function CaptadorDashboard() {
  const [prospectos, setProspectos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [loadingInscritos, setLoadingInscritos] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    // Polling cada 30 segundos para refrescar datos
    const interval = setInterval(() => { cargarDatos(); }, 30000);
    const handleVisibility = () => { if (document.visibilityState === 'visible') cargarDatos(); };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prosRes, evRes] = await Promise.all([
        api.get('/prospectos/mis'),
        api.get('/eventos/mis')
      ]);
      setProspectos(prosRes.data.data || prosRes.data);
      setEventos(evRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // Determinar estado de la actividad
  const getEstadoActividad = (evento) => {
    const now = new Date();
    const inicio = new Date(evento.fecha_inicio);
    const fin = new Date(evento.fecha_fin);
    if (now < inicio) return { label: 'Próxima', color: '#FFB800', bg: '#FFF8E1' };
    if (now > fin) return { label: 'Finalizada', color: '#666666', bg: '#EEEEEE' };
    return { label: 'Activa', color: '#43B02A', bg: '#E8F5E9' };
  };

  const verInscritos = async (evento) => {
    setSelectedEvento(evento);
    setLoadingInscritos(true);
    try {
      const res = await api.get(`/prospectos/evento/${evento.id}`);
      setInscritos(res.data.data || res.data);
    } catch (err) {
      setInscritos([]);
    } finally {
      setLoadingInscritos(false);
    }
  };

  const hoy = prospectos.filter((p) => {
    const d = new Date(p.fecha_captura);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const estaSemana = prospectos.filter((p) => {
    const d = new Date(p.fecha_captura);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EEEEEE', fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <header style={{ background: '#FFFFFF', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #CCCCCC', boxShadow: '0 1px 3px rgba(26,26,26,0.04)' }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666666', letterSpacing: '0' }}>Mi panel</span>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: '#1A1A1A' }}>Mis capturas</h1>
          <span style={{ fontSize: '0.8rem', color: '#666666' }}>Prospectos registrados por ti</span>
        </div>
        <button onClick={handleLogout} className="ghost" style={{ color: '#1A1A1A', border: '1px solid #CCCCCC', background: '#FFFFFF', height: '36px', fontSize: '0.85rem', padding: '0 1rem' }}>
          Cerrar sesión
        </button>
      </header>

      <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        {/* KPIs personales */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, background: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: '4px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(26,26,26,0.08)', position: 'relative' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#666666', margin: 0 }}>Total capturados</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', margin: '0.5rem 0 0.25rem 0' }}>{prospectos.length}</p>
            <p style={{ fontSize: '0.7rem', color: '#666666', margin: 0 }}>Todos los tiempos</p>
          </div>
          <div style={{ flex: 1, minWidth: 200, background: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: '4px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(26,26,26,0.08)', position: 'relative' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#666666', margin: 0 }}>Capturados hoy</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', margin: '0.5rem 0 0.25rem 0' }}>{hoy}</p>
            <p style={{ fontSize: '0.7rem', color: '#666666', margin: 0 }}>Hoy</p>
          </div>
          <div style={{ flex: 1, minWidth: 200, background: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: '4px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(26,26,26,0.08)', position: 'relative' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#666666', margin: 0 }}>Esta semana</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1A1A1A', margin: '0.5rem 0 0.25rem 0' }}>{estaSemana}</p>
            <p style={{ fontSize: '0.7rem', color: '#666666', margin: 0 }}>Últimos 7 días</p>
          </div>
        </div>

        {/* Mis actividades asignadas */}
        {eventos.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#1A1A1A', marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>Mis actividades asignadas</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {eventos.map((e) => (
                <div key={e.id} style={{ flex: 1, minWidth: 280, background: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: '4px', padding: '1rem', boxShadow: '0 2px 8px rgba(26,26,26,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: '#1A1A1A', fontSize: '1rem', fontWeight: 700 }}>{e.nombre}</h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '100px', background: getEstadoActividad(e).bg, color: getEstadoActividad(e).color }}>{getEstadoActividad(e).label}</span>
                  </div>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666666' }}>Tipo: {e.tipo}</p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666666' }}>Inicio: {formatDateCL(e.fecha_inicio, true)}</p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666666' }}>Fin: {formatDateCL(e.fecha_fin, true)}</p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666666' }}>Ubicación: {e.ubicacion}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <a
                      href={`/?evento_id=${e.id}`}
                      style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#FFB800', color: '#1A1A1A', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      Capturar prospecto
                    </a>
                    <button
                      className="ghost"
                      onClick={() => verInscritos(e)}
                      style={{ fontSize: '0.85rem', height: '36px', padding: '0 1rem' }}
                      aria-label="Ver inscritos de la actividad"
                    >
                      Ver inscritos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabla de inscritos por actividad seleccionada */}
        {selectedEvento && (
          <div style={{ background: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: '4px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(26,26,26,0.08)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ color: '#1A1A1A', margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Inscritos en: {selectedEvento.nombre}</h3>
              <button className="ghost" onClick={() => { setSelectedEvento(null); setInscritos([]); }} style={{ fontSize: '0.85rem', height: '32px', padding: '0 0.75rem' }}>Cerrar</button>
            </div>
            {loadingInscritos ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#666666' }}>Cargando inscritos...</p>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #1A1A1A', background: '#EEEEEE' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>RUT</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Nombre</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Correo</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Teléfono</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Fecha captura</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscritos.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #CCCCCC' }}>
                          <td style={{ padding: '0.5rem' }}>{p.rut}</td>
                          <td style={{ padding: '0.5rem' }}>{p.nombre_completo}</td>
                          <td style={{ padding: '0.5rem' }}>{p.correo || '-'}</td>
                          <td style={{ padding: '0.5rem' }}>{p.telefono || '-'}</td>
                          <td style={{ padding: '0.5rem' }}>{formatDateCL(p.fecha_captura, true)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {inscritos.length === 0 && <p style={{ textAlign: 'center', padding: '1rem', color: '#666666' }}>No hay inscritos en esta actividad.</p>}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tabla de mis prospectos */}
        <div style={{ background: '#FFFFFF', border: '1px solid #CCCCCC', borderRadius: '4px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(26,26,26,0.08)' }}>
          <h3 style={{ color: '#1A1A1A', marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>Mis prospectos capturados</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1A1A1A', background: '#EEEEEE' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>RUT</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actividad</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {prospectos.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #CCCCCC' }}>
                    <td style={{ padding: '0.5rem' }}>{p.rut}</td>
                    <td style={{ padding: '0.5rem' }}>{p.nombre_completo}</td>
                    <td style={{ padding: '0.5rem' }}>{p.evento?.nombre || 'Sin actividad'}</td>
                    <td style={{ padding: '0.5rem' }}>{formatDateCL(p.fecha_captura)}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <button className="ghost" onClick={() => setSelectedProspect(p)} style={{ fontSize: '0.85rem' }} aria-label="Ver detalle del prospecto">Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prospectos.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#666666' }}>No has capturado prospectos aún.</p>}
          </div>
        </div>

        {/* Gráficos (opcional) */}
        <Suspense fallback={<p>Cargando gráficos...</p>}>
          <DetailCharts prospectos={prospectos} />
        </Suspense>
      </div>

      <ProspectDetailModal prospecto={selectedProspect} onClose={() => setSelectedProspect(null)} />
    </div>
  );
}
