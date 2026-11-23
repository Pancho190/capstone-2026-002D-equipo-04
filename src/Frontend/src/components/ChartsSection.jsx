import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#1A1A1A', '#6dd400', '#d32f2f', '#ed6c02', '#9c27b0', '#00bcd4', '#ff9800', '#795548'];

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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const regionData = aggregate(prospectos, 'region');
  const escuelaData = prospectos.reduce((acc, p) => {
    const key = p.escuela && p.carrera_interes ? `${p.escuela} - ${p.carrera_interes}` : (p.carrera_interes || p.escuela || 'Sin datos');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const escuelaChartData = Object.entries(escuelaData).map(([name, value]) => ({ name, value }));
  const dateData = byDate(prospectos);

  if (prospectos.length === 0) return null;

  const escuelaYAxisWidth = isMobile ? 100 : 195;
  const escuelaTickFontSize = isMobile ? 8 : 9;
  const escuelaLeftMargin = isMobile ? 0 : 200;
  const escuelaHeight = Math.max(isMobile ? 200 : 300, escuelaChartData.length * (isMobile ? 22 : 28));

  return (
    <div style={{ marginTop: '1.5rem', minWidth: 0 }}>
      {/* Bar horizontal: ancho completo */}
      <div className="card" style={{ width: '100%', margin: '0 0 1rem 0', padding: isMobile ? '0.75rem' : '1rem', minWidth: 0, boxSizing: 'border-box' }}>
        <h4 style={{ color: '#172b46', marginBottom: '0.5rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: '0.95rem', fontWeight: 600 }}>Prospectos por carrera y escuela</h4>
        <div style={{ width: '100%', minWidth: 0, overflowX: 'auto' }}>
          <ResponsiveContainer width="100%" height={escuelaHeight} minWidth={0}>
            <BarChart data={escuelaChartData} layout="vertical" margin={{ top: 5, right: isMobile ? 10 : 20, left: escuelaLeftMargin, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: isMobile ? 10 : 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: escuelaTickFontSize }} width={escuelaYAxisWidth} />
              <Tooltip />
              <Bar dataKey="value" fill="#1A1A1A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', minWidth: 0 }}>
        {/* Pie: por región */}
        <div className="card" style={{ flex: 1, minWidth: isMobile ? '100%' : 280, margin: 0, padding: '1rem', boxSizing: 'border-box' }}>
          <h4 style={{ color: '#172b46', marginBottom: '0.5rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: '0.95rem', fontWeight: 600 }}>Prospectos por región</h4>
          <ResponsiveContainer width="100%" height={220} minWidth={0}>
            <PieChart>
              <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={isMobile ? 60 : 70} label={{ fontSize: 11 }}>
                {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line: por fecha */}
        <div className="card" style={{ flex: 1, minWidth: isMobile ? '100%' : 280, margin: 0, padding: '1rem', boxSizing: 'border-box' }}>
          <h4 style={{ color: '#172b46', marginBottom: '0.5rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: '0.95rem', fontWeight: 600 }}>Prospectos por fecha de captura</h4>
          <ResponsiveContainer width="100%" height={220} minWidth={0}>
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
