import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function Scanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const scannedRef = useRef(false);
  const controlsRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    async function start() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const video = videoRef.current;
        if (!video) {
          setError('El elemento video no está disponible');
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        video.srcObject = stream;

        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve();
        });
        await video.play();
        setReady(true);

        const controlsPromise = reader.decodeFromStream(stream, video, (result, err) => {
          if (scannedRef.current) return;
          if (result) {
            scannedRef.current = true;
            stream.getTracks().forEach((t) => t.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
            controlsPromise.then((controls) => {
              if (controls && typeof controls.stop === 'function') controls.stop();
            }).catch(() => {});
            onScan(result.getText());
            onClose();
          }
        });
        controlsRef.current = controlsPromise;
      } catch (e) {
        setError('Error: ' + e.message);
        console.error(e);
      }
    }

    start();

    return () => {
      if (controlsRef.current) {
        controlsRef.current.then((controls) => {
          if (controls && typeof controls.stop === 'function') controls.stop();
        }).catch(() => {});
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onScan, onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '90%', maxWidth: 400, minHeight: 200, border: '2px solid white', background: '#000' }}
      />
      {!ready && !error && <p style={{ color: 'white' }}>Iniciando cámara...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ color: 'white', fontSize: 12, marginTop: 8 }}>Encuadra el código PDF417 (reverso de la cédula)</p>
      <button onClick={onClose} style={{ marginTop: 10 }}>Cerrar</button>
    </div>
  );
}
