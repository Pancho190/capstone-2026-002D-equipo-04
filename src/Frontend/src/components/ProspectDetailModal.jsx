import { useEffect, useRef } from 'react';

export default function ProspectDetailModal({ prospecto, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    modal.addEventListener('keydown', handleKeyDown);

    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    modal.addEventListener('keydown', trap);
    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
      modal.removeEventListener('keydown', trap);
    };
  }, []);

  if (!prospecto) return null;

  const anioLabels = {
    '1': '1° Medio',
    '2': '2° Medio',
    '3': '3° Medio',
    '4': '4° Medio',
    '5': '1° y 2° Medio (2x1)',
    '6': '3° y 4° Medio (2x1)',
    '7': 'Egresado'
  };

  const fields = [
    { label: 'RUT', value: prospecto.rut },
    { label: 'Nombres', value: prospecto.nombre_completo },
    { label: 'Apellido', value: prospecto.apellidos },
    { label: 'Género', value: prospecto.genero },
    { label: 'Fecha nacimiento', value: prospecto.fecha_nacimiento ? new Date(prospecto.fecha_nacimiento).toLocaleDateString() : '-' },
    { label: 'Región', value: prospecto.region },
    { label: 'Comuna', value: prospecto.comuna },
    { label: 'Año en curso', value: anioLabels[prospecto.anio_curso] || prospecto.anio_curso || '-' },
    { label: 'Identificación', value: prospecto.identificacion },
    { label: 'Escuela', value: prospecto.escuela },
    { label: 'Carrera de interés', value: prospecto.carrera_interes },
    { label: 'Sede de preferencia', value: prospecto.sede_preferencia },
    { label: 'Email', value: prospecto.correo },
    { label: 'Teléfono', value: prospecto.telefono },
    { label: 'Actividad', value: prospecto.evento?.nombre },
    { label: 'Fecha captura', value: new Date(prospecto.fecha_captura).toLocaleString() }
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div ref={modalRef} style={{ background: 'white', borderRadius: 8, padding: '1.5rem', maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', color: '#1A1A1A', margin: 0 }}>Detalle del prospecto</h3>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#666666' }}>✕</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <tbody>
            {fields.map((f) => (
              <tr key={f.label} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700, color: '#1A1A1A', width: '40%' }}>{f.label}</td>
                <td style={{ padding: '0.5rem' }}>{f.value || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="primary" onClick={onClose} style={{ marginTop: '1rem', width: '100%' }}>Cerrar</button>
      </div>
    </div>
  );
}
