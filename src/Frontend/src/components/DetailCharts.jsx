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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
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

  const chartMargin = isMobile ? { top: 5, right: 10, left: 0, bottom: 5 } : { top: 5, right: 20, left: 0, bottom: 5 };
  const escuelaMargin = isMobile ? { top: 5, right: 10, left: 0, bottom: 5 } : { top: 5, right: 20, left: 180, bottom: 5 };
  const escuelaYAxisWidth = isMobile ? 120 : 175;
  const escuelaTickFontSize = isMobile ? 8 : 9;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: isMobile ? '100%' : 280, margin: 0, padding: '1rem' }}>
          <h4 style={{ color: '#172b46', marginBottom: '0.5rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: '0.95rem', fontWeight: 600 }}>Por región</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={isMobile ? 50 : 60} label={{ fontSize: 10 }}>
                {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 1, minWidth: isMobile ? '100%' : 280, margin: 0, padding: '1rem' }}>
          <h4 style={{ color: '#172b46', marginBottom: '0.5rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: '0.95rem', fontWeight: 600 }}>Por género</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={generoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={isMobile ? 50 : 60} label={{ fontSize: 10 }}>
                {generoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h4 style={{ color: '#172b46', marginBottom: '0.5rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: '0.95rem', fontWeight: 600 }}>Por edad</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ageData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#6dd400" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h4 style={{ color: '#172b46', marginBottom: '0.5rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: '0.95rem', fontWeight: 600 }}>Por carrera y escuela</h4>
        <ResponsiveContainer width="100%" height={Math.max(isMobile ? 150 : 200, escuelaChartData.length * (isMobile ? 20 : 24))}>
          <BarChart data={escuelaChartData} layout="vertical" margin={escuelaMargin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: escuelaTickFontSize }} width={escuelaYAxisWidth} />
            <Tooltip />
            <Bar dataKey="value" fill="#0033a0" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
