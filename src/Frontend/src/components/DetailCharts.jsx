import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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

function byAge(prospectos) {
  const map = { '<18': 0, '18-24': 0, '25-34': 0, '35+': 0, 'Sin fecha': 0 };
  const now = new Date();
  prospectos.forEach((p) => {
    if (!p.fecha_nacimiento) { map['Sin fecha']++; return; }
    const birth = new Date(p.fecha_nacimiento);
    const age = now.getFullYear() - birth.getFullYear();
    if (age < 18) map['<18']++;
    else if (age <= 24) map['18-24']++;
    else if (age <= 34) map['25-34']++;
    else map['35+']++;
  });
  return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
}

export default function DetailCharts({ prospectos }) {
  const regionData = aggregate(prospectos, 'region');
  const escuelaData = prospectos.reduce((acc, p) => {
    const key = p.escuela && p.carrera_interes ? `${p.escuela} - ${p.carrera_interes}` : (p.carrera_interes || p.escuela || 'Sin datos');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const escuelaChartData = Object.entries(escuelaData).map(([name, value]) => ({ name, value }));
  const ageData = byAge(prospectos);
  const generoData = aggregate(prospectos, 'genero');

  if (prospectos.length === 0) return null;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: 280, margin: 0, padding: '1rem' }}>
          <h4 style={{ color: '#0033a0', marginBottom: '0.5rem', fontFamily: 'Lato, sans-serif' }}>Por región</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={{ fontSize: 10 }}>
                {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 280, margin: 0, padding: '1rem' }}>
          <h4 style={{ color: '#0033a0', marginBottom: '0.5rem', fontFamily: 'Lato, sans-serif' }}>Por género</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={generoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={{ fontSize: 10 }}>
                {generoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h4 style={{ color: '#0033a0', marginBottom: '0.5rem', fontFamily: 'Lato, sans-serif' }}>Por edad</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ageData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#6dd400" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h4 style={{ color: '#0033a0', marginBottom: '0.5rem', fontFamily: 'Lato, sans-serif' }}>Por carrera y escuela</h4>
        <ResponsiveContainer width="100%" height={Math.max(200, escuelaChartData.length * 24)}>
          <BarChart data={escuelaChartData} layout="vertical" margin={{ top: 5, right: 20, left: 180, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={175} />
            <Tooltip />
            <Bar dataKey="value" fill="#0033a0" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
