import ProspectoForm from './pages/ProspectoForm';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{ background: 'var(--color-primary)', color: 'white', padding: '1rem', textAlign: 'center', fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>
        Captura Digital de Prospectos
      </header>
      <main>
        <ProspectoForm />
      </main>
    </div>
  );
}
