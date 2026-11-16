import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ActivityChart({ eventos, prospectos }) {
  const data = eventos.map((e) => ({
    name: e.nombre,
    prospectos: prospectos.filter((p) => p.evento_id === e.id).length
  }));

  if (data.length === 0) return null;

  return (
    <div style={{ width: '100%', height: 300, marginTop: '1.5rem' }}>
      <h3 style={{ marginBottom: '0.75rem', color: '#0033a0', fontFamily: 'Lato, sans-serif' }}>Prospectos por actividad</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="prospectos" fill="#6dd400" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
