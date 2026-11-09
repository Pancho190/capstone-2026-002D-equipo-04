import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function Scanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream;
    let rafId;
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
        console.log('Cámara iniciada');

        if ('BarcodeDetector' in window) {
          const detector = new BarcodeDetector({ formats: ['pdf417'] });
          const detect = async () => {
            try {
              const barcodes = await detector.detect(video);
              if (barcodes.length > 0) {
                onScan(barcodes[0].rawValue);
                onClose();
                return;
              }
            } catch (e) {
              // ignorar errores de detección por frame
            }
            rafId = requestAnimationFrame(detect);
          };
          detect();
        } else {
          reader.decodeFromStream(stream, video, (result, err) => {
            if (result) {
                onScan(result.getText());
                onClose();
              }
          });
        }
      } catch (e) {
        setError('Error: ' + e.message);
        console.error(e);
      }
    }

    start();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onScan, onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
