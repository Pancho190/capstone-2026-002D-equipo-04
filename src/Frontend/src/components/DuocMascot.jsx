import { useState } from 'react';

export default function DuocMascot({ size = 60 }) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="duoc-mascot" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
      {showDialog && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          right: 0,
          marginBottom: '0.5rem',
          background: '#FFFFFF',
          border: '2px solid #1A1A1A',
          borderRadius: '12px',
          padding: '0.4rem 0.85rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#1A1A1A',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
          animation: 'duocFadeIn 0.2s ease',
          zIndex: 10
        }}>
          ¡Duoc UC!
        </div>
      )}
      <button
        type="button"
        onClick={() => setShowDialog(!showDialog)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          animation: 'duocFloat 3s ease-in-out infinite'
        }}
        aria-label="Mascota Duoc UC. Haz clic para un saludo."
      >
        <img
          src="/DucoMascota.png"
          alt="Mascota Duoc UC"
          style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
        />
      </button>
    </div>
  );
}
