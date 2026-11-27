import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ActivityChart({ eventos, prospectos }) {
  const data = eventos.map((e) => ({
    name: e.nombre,
    prospectos: prospectos.filter((p) => p.evento_id === e.id).length
  }));

  if (data.length === 0) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div style={{ width: '100%', height: 300, marginTop: '1.5rem', minWidth: 0, boxSizing: 'border-box' }}>
      <h3 style={{ marginBottom: '0.75rem', color: '#1A1A1A', fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600 }}>Prospectos por actividad</h3>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} margin={{ top: 5, right: isMobile ? 10 : 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="prospectos" fill="#FFB800" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
