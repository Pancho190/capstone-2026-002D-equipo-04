import { useState, useEffect } from 'react';
import api from '../api';
import { addPending, syncPending, getPending } from '../offline';
import Scanner from '../components/Scanner';

function parseCedula(text) {
  try {
    const url = new URL(text);
    const params = new URLSearchParams(url.search);
    const run = params.get('RUN') || '';
    const name = decodeURIComponent(params.get('name') || '').replace(/\s+/g, ' ').trim();
    // Parsear fecha de nacimiento desde el MRZ (formato YYMMDD en posiciones 10-15)
    let fecha = '';
    const mrz = params.get('mrz') || '';
    if (mrz.length >= 16) {
      const yy = mrz.slice(10, 12);
      const mm = mrz.slice(12, 14);
      const dd = mrz.slice(14, 16);
      fecha = `20${yy}-${mm}-${dd}`;
    }
    return { rut: run, nombre: name, fecha };
  } catch {
    const rutMatch = text.match(/\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]/);
    return { rut: rutMatch ? rutMatch[0] : '', nombre: '', fecha: '' };
  }
}

export default function ProspectoForm() {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [msg, setMsg] = useState('');
  const [pendingCount, setPendingCount] = useState(getPending().length);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const handler = () => syncPending(api).then(() => setPendingCount(getPending().length));
    window.addEventListener('online', handler);
    if (navigator.onLine) handler();
    return () => window.removeEventListener('online', handler);
  }, []);

  const handleScan = (text) => {
    const parsed = parseCedula(text);
    if (parsed.rut) setRut(parsed.rut);
    if (parsed.nombre) setNombre(parsed.nombre);
    if (parsed.fecha) setFecha(parsed.fecha);
    setMsg('Datos escaneados. Revisa y guarda.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { rut, nombre_completo: nombre, fecha_nacimiento: fecha || null };
    if (!navigator.onLine) {
      addPending(data);
      setPendingCount(getPending().length);
      setMsg('Guardado offline. Se sincronizara al recuperar conexion.');
      setRut(''); setNombre(''); setFecha('');
      return;
    }
    try {
      const res = await api.post('/prospectos', data);
      setMsg(res.data.mensaje);
      setRut(''); setNombre(''); setFecha('');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error al guardar');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Capturar prospecto</h2>
      <button onClick={() => setShowScanner(true)} style={{ marginBottom: 10 }}>
        Escanear cedula
      </button>
      {showScanner && <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      <form onSubmit={handleSubmit}>
        <input placeholder="RUT" value={rut} onChange={(e) => setRut(e.target.value)} required />
        <br />
        <input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <br />
        <input placeholder="Fecha nacimiento (YYYY-MM-DD)" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <br />
        <button type="submit">Guardar</button>
      </form>
      {msg && <p>{msg}</p>}
      {pendingCount > 0 && <p style={{ color: 'orange' }}>Pendientes de sincronizar: {pendingCount}</p>}
    </div>
  );
}
