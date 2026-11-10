import { useState } from 'react';
import Login from './pages/Login';
import ProspectoForm from './pages/ProspectoForm';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{ background: 'var(--color-primary)', color: 'white', padding: '1rem', textAlign: 'center', fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>
        Captura Digital de Prospectos
      </header>
      <main>
        <button
          className="ghost"
          onClick={() => { localStorage.removeItem('token'); setToken(null); }}
          style={{ margin: '1rem', float: 'right' }}
        >
          Cerrar sesión
        </button>
        <ProspectoForm />
      </main>
    </div>
  );
}
