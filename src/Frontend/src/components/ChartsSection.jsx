import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#0033a0', '#6dd400', '#d32f2f', '#ed6c02', '#9c27b0', '#00bcd4', '#ff9800', '#795548'];

function aggregate(prospectos, key) {
  const map = {};
  prospectos.forEach((p) => {
    const val = p[key] || 'Sin datos';
    map[val] = (map[val] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function byDate(prospectos) {
  const map = {};
  prospectos.forEach((p) => {
    const d = new Date(p.fecha_captura).toLocaleDateString();
    map[d] = (map[d] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => new Date(a.name) - new Date(b.name));
}

export default function ChartsSection({ prospectos }) {
  const regionData = aggregate(prospectos, 'region');
  const escuelaData = prospectos.reduce((acc, p) => {
    const key = p.escuela && p.carrera_interes ? `${p.escuela} - ${p.carrera_interes}` : (p.carrera_interes || p.escuela || 'Sin datos');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const escuelaChartData = Object.entries(escuelaData).map(([name, value]) => ({ name, value }));
  const dateData = byDate(prospectos);

  if (prospectos.length === 0) return null;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Bar horizontal: ancho completo */}
      <div className="card" style={{ width: '100%', margin: '0 0 1rem 0', padding: '1rem' }}>
        <h4 style={{ color: '#0033a0', marginBottom: '0.5rem', fontFamily: 'Lato, sans-serif' }}>Prospectos por carrera y escuela</h4>
        <ResponsiveContainer width="100%" height={Math.max(300, escuelaChartData.length * 28)}>
          <BarChart data={escuelaChartData} layout="vertical" margin={{ top: 5, right: 20, left: 200, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={195} />
            <Tooltip />
            <Bar dataKey="value" fill="#0033a0" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Pie: por región */}
        <div className="card" style={{ flex: 1, minWidth: 280, margin: 0, padding: '1rem' }}>
          <h4 style={{ color: '#0033a0', marginBottom: '0.5rem', fontFamily: 'Lato, sans-serif' }}>Prospectos por región</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 11 }}>
                {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line: por fecha */}
        <div className="card" style={{ flex: 1, minWidth: 280, margin: 0, padding: '1rem' }}>
          <h4 style={{ color: '#0033a0', marginBottom: '0.5rem', fontFamily: 'Lato, sans-serif' }}>Prospectos por fecha de captura</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dateData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6dd400" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
