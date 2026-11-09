import { useEffect, useRef, useState } from 'react';

export default function CameraTest({ onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().then(() => setReady(true)).catch((e) => setError('play: ' + e.message));
        };
      } catch (e) {
        setError('getUserMedia: ' + e.message);
      }
    }
    start();
    return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '90%', maxWidth: 400, minHeight: 200, border: '2px solid white', background: '#333' }} />
      {!ready && !error && <p style={{ color: 'white' }}>Iniciando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={onClose} style={{ marginTop: 10 }}>Cerrar</button>
    </div>
  );
}