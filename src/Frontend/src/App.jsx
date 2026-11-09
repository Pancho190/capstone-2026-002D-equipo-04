import { useState } from 'react';
import Login from './pages/Login';
import ProspectoForm from './pages/ProspectoForm';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div>
      <button onClick={() => { localStorage.removeItem('token'); setToken(null); }}>
        Cerrar sesión
      </button>
      <ProspectoForm />
    </div>
  );
}