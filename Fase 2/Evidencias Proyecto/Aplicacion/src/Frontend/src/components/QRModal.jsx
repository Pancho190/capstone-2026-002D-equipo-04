import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRModal({ evento, onClose }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!evento || !canvasRef.current) return;
    const url = `${window.location.origin}/?evento_id=${evento.id}`;
    QRCode.toCanvas(canvasRef.current, url, { width: 256, margin: 2 }, (err) => {
      if (err) setError('Error al generar QR');
    });
  }, [evento]);

  const descargar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${evento.nombre}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!evento) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 8, padding: '1.5rem', maxWidth: 320, width: '100%', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-body)', color: '#1A1A1A' }}>QR de actividad</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666666' }}>{evento.nombre}</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <canvas ref={canvasRef} style={{ margin: '0 auto', display: 'block' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
          <button type="button" className="primary" onClick={descargar}>Descargar QR</button>
          <button type="button" className="ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
