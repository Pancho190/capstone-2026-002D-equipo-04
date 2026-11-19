import { useState, useEffect, lazy, Suspense } from 'react';
import api from '../api';
import { addPending, syncPending, getPending } from '../offline';
import ConsentModal from '../components/ConsentModal';
const Scanner = lazy(() => import('../components/Scanner'));
import { escuelas, carrerasPorEscuela, sedes } from '../data/duoc';
import { regiones, comunasPorRegion } from '../data/chile';
import { parseCedula, toISODate, formatRut, formatFecha } from '../utils';

export default function ProspectoForm() {
  const [rut, setRut] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellido, setApellido] = useState('');
  const [genero, setGenero] = useState('');
  const [anioCurso, setAnioCurso] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [escuela, setEscuela] = useState('');
  const [carrera, setCarrera] = useState('');
  const [sede, setSede] = useState('');
  const [autorizaEmail, setAutorizaEmail] = useState(false);
  const [autorizaTelefono, setAutorizaTelefono] = useState(false);
  const [consentimiento, setConsentimiento] = useState(false);
  const [locked, setLocked] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');
  const [pendingCount, setPendingCount] = useState(getPending().length);
  const [showScanner, setShowScanner] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const eventoIdFromUrl = params.get('evento_id');

  const [comunas, setComunas] = useState([]);

  useEffect(() => {
    const handler = () => syncPending(api).then(() => setPendingCount(getPending().length));
    window.addEventListener('online', handler);
    if (navigator.onLine) handler();
    return () => window.removeEventListener('online', handler);
  }, []);

  useEffect(() => {
    if (!region) { setComunas([]); return; }
    setComunas(comunasPorRegion[region] || []);
  }, [region]);

  const handleScan = (text) => {
    const parsed = parseCedula(text);
    if (parsed.rut) setRut(formatRut(parsed.rut));
    if (parsed.nombres) setNombres(parsed.nombres);
    if (parsed.apellido) setApellido(parsed.apellido);
    if (parsed.fecha) {
      // Convertir de ISO (YYYY-MM-DD) a DD-MM-YYYY
      const iso = parsed.fecha;
      if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const [y, m, d] = iso.split('-');
        setFecha(formatFecha(`${d}${m}${y}`));
      } else {
        setFecha(formatFecha(parsed.fecha));
      }
    }
    setLocked(true);
    setMsg('Datos escaneados. Revisa y guarda.');
    setMsgType('info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentimiento) {
      setMsg('Debes aceptar el consentimiento informado.');
      setMsgType('error');
      return;
    }
    const data = {
      rut,
      nombre_completo: nombres,
      apellidos: apellido,
      genero: genero || null,
      correo: email || null,
      telefono: telefono || null,
      fecha_nacimiento: toISODate(fecha),
      anio_curso: anioCurso || null,
      region: region || null,
      comuna: comuna || null,
      identificacion: identificacion || null,
      escuela: escuela || null,
      carrera_interes: carrera || null,
      sede_preferencia: sede || null,
      evento_id: eventoIdFromUrl || null
    };
    if (!navigator.onLine) {
      addPending(data);
      setPendingCount(getPending().length);
      setMsg('Guardado offline. Se sincronizara al recuperar conexion.');
      setMsgType('info');
      resetForm();
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/prospectos', data);
      setMsg(res.data.mensaje);
      setMsgType('success');
      resetForm();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error al guardar');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRut(''); setNombres(''); setApellido(''); setGenero(''); setAnioCurso(''); setEmail(''); setTelefono(''); setFecha('');
    setRegion(''); setComuna(''); setIdentificacion(''); setEscuela(''); setCarrera(''); setSede('');
    setAutorizaEmail(false); setAutorizaTelefono(false); setConsentimiento(false); setLocked(false);
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '0.25rem', fontFamily: 'Lato, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', overflowWrap: 'break-word', minWidth: 0 }}>Capturar prospecto</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>Completa tus datos o escanea tu cédula para autocompletar.</p>
      <button type="button" className="primary" onClick={() => setShowScanner(true)} style={{ marginBottom: '1.25rem', height: '52px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} aria-label="Escanear cedula de identidad">
        Escanear cédula
      </button>
      {showScanner && (
        <Suspense fallback={<p>Cargando escáner...</p>}>
          <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />
        </Suspense>
      )}
      <form onSubmit={handleSubmit}>
        <p className="section-title">Datos personales</p>
        <p style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '0.75rem' }}>Ingresa la informacion tal como aparece en la cedula.</p>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="rut">RUT</label>
            <input id="rut" name="rut" placeholder="12.345.678-9" value={rut} onChange={(e) => setRut(formatRut(e.target.value))} required disabled={locked} autoComplete="off" />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="nombres">Nombres</label>
            <input id="nombres" placeholder="Nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} required disabled={locked} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="apellido">Primer Apellido</label>
            <input id="apellido" placeholder="Primer Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required disabled={locked} />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="genero">Género</label>
            <select id="genero" value={genero} onChange={(e) => setGenero(e.target.value)}>
              <option value="">Seleccione Género</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
              <option value="prefiero_no_decir">Prefiero no decir</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="anioCurso">Año en Curso</label>
            <select id="anioCurso" value={anioCurso} onChange={(e) => setAnioCurso(e.target.value)}>
              <option value="">Seleccione Año</option>
              <option value="1">1° Medio</option>
              <option value="2">2° Medio</option>
              <option value="3">3° Medio</option>
              <option value="4">4° Medio</option>
              <option value="5">1° y 2° Medio (2x1)</option>
              <option value="6">3° y 4° Medio (2x1)</option>
              <option value="7">Egresado</option>
            </select>
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="fecha">Fecha nacimiento</label>
            <input id="fecha" placeholder="DD-MM-YYYY" value={fecha} onChange={(e) => setFecha(formatFecha(e.target.value))} disabled={locked} />
          </div>
        </div>
        <p className="section-title">Ubicación</p>
        <p style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '0.75rem' }}>Selecciona tu region y comuna.</p>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="region">Región</label>
            <select id="region" value={region} onChange={(e) => { setRegion(e.target.value); setComuna(''); }}>
              <option value="">Seleccione Región</option>
              {regiones.map((r) => (
                <option key={r.codigo} value={r.nombre}>{r.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="comuna">Comuna</label>
            <select id="comuna" value={comuna} onChange={(e) => setComuna(e.target.value)} disabled={!region}>
              <option value="">Seleccione Comuna</option>
              {comunas.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="section-title">Interés académico</p>
        <p style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '0.75rem' }}>Conoce sus motivaciones y preferencias de estudio.</p>
        <div className="form-row">
          <div className="form-group col-md-12">
            <label htmlFor="identificacion">De las siguientes afirmaciones, ¿Con cuál te sientes más identificado?</label>
            <select id="identificacion" value={identificacion} onChange={(e) => setIdentificacion(e.target.value)}>
              <option value="">Seleccione</option>
              <option value="1">Estudiar es una inversión para aumentar mis ingresos y progresar en la vida, tanto yo como mi familia.</option>
              <option value="2">Estudiar es seguir mi vocación para encontrar mi lugar en el mundo laboral. Los ingresos que recibiré no son lo central.</option>
              <option value="3">Estudiar es una nueva oportunidad de retomar esa carrera que dejé pendiente, postergué, o de darme la posibilidad de comenzar otra nueva carrera.</option>
              <option value="4">Estudiar es muy importante, sin embargo, no sé si tendré los ingresos suficientes para financiar mi carrera.</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="escuela">Indica tu Escuela de preferencia</label>
            <select id="escuela" value={escuela} onChange={(e) => { setEscuela(e.target.value); setCarrera(''); }}>
              <option value="">Seleccione Escuela</option>
              {escuelas.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="carrera">Carrera de tu interés</label>
            <select id="carrera" value={carrera} onChange={(e) => setCarrera(e.target.value)} disabled={!escuela}>
              <option value="">Seleccione Lista</option>
              {(carrerasPorEscuela[escuela] || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="sede">Sede de Preferencia</label>
            <select id="sede" value={sede} onChange={(e) => setSede(e.target.value)}>
              <option value="">Seleccione Sede</option>
              {sedes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="section-title">Contacto</p>
        <p style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '0.75rem' }}>Indica los datos y los canales autorizados de contacto.</p>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="email@ejemplo.cl" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="telefono">Teléfono</label>
            <input id="telefono" name="telefono" type="tel" placeholder="9 1234 5678" value={telefono} onChange={(e) => setTelefono(e.target.value)} required autoComplete="tel" />
          </div>
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" id="autEmail" checked={autorizaEmail} onChange={(e) => setAutorizaEmail(e.target.checked)} style={{ width: 'auto', margin: 0 }} />
          <label htmlFor="autEmail" style={{ margin: 0 }}>Autorizo a contactarme por email</label>
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" id="autTel" checked={autorizaTelefono} onChange={(e) => setAutorizaTelefono(e.target.checked)} style={{ width: 'auto', margin: 0 }} />
          <label htmlFor="autTel" style={{ margin: 0 }}>Autorizo a contactarme por telefono</label>
        </div>
        <p className="section-title">Consentimiento</p>
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <input type="checkbox" id="consentimiento" checked={consentimiento} onChange={(e) => setConsentimiento(e.target.checked)} required style={{ width: 'auto', margin: 0, marginTop: '0.25rem' }} />
          <label htmlFor="consentimiento" style={{ margin: 0, fontSize: '0.85rem' }}>
            Acepto que los datos e informacion que comparta se mantendran bajo reserva conforme a lo estipulado en la Ley N°19.628, resguardando la confidencialidad, siendo utilizados por Duoc UC solo para efectos de gestion interna, analisis de informacion y mantener contacto.
          </label>
        </div>
        <button type="button" className="ghost" onClick={() => setShowConsent(true)} style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
          Ver Consentimiento Informado
        </button>
        {showConsent && <ConsentModal onClose={() => setShowConsent(false)} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
          <span>Los datos se tratan de forma confidencial.</span>
        </div>
        <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar formulario'}
        </button>
      </form>
      {msg && <p className={`msg ${msgType}`} role="status" aria-live="polite">{msg}</p>}
      {pendingCount > 0 && <p className="msg info">Pendientes de sincronizar: {pendingCount}</p>}
    </div>
  );
}
