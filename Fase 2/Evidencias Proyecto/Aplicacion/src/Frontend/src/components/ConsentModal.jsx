import { useEffect, useRef } from 'react';

export default function ConsentModal({ onClose }) {
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

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 51, 160, 0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div ref={modalRef} style={{ background: '#fff', borderRadius: 8, maxWidth: 560, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0, 0, 51, 0.15)' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '2px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: '#1A1A1A', fontSize: '1.15rem', margin: 0 }}>
            Consentimiento Informado
          </h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ background: 'transparent', color: '#666666', fontSize: '1.25rem', padding: '0.25rem 0.5rem', lineHeight: 1, border: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, fontSize: '0.9rem', lineHeight: 1.7, color: '#212529' }}>
          <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
            ¿Qué significa sí, autorizo?
          </h4>
          <p style={{ marginBottom: '0.75rem' }}>
            Al aceptar este consentimiento, usted autoriza expresamente a Duoc UC a tratar los datos personales que ha proporcionado, para los fines que se detallan a continuación:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>Comunicarse con usted e informarle sobre novedades, servicios y beneficios de Duoc UC, o de entidades relacionadas, así como enviarle comunicaciones promocionales por medios electrónicos o telefónicos. Conforme al Art. 28 B de la Ley Nº 19.496, Usted podrá solicitar en cualquier momento dejar de recibir este tipo de comunicaciones.</li>
            <li style={{ marginBottom: '0.4rem' }}>Invitarle a participar en actividades, iniciativas, concursos y otros eventos organizados por Duoc UC.</li>
            <li style={{ marginBottom: '0.4rem' }}>Realizar encuestas, estudios y análisis estadísticos, incluyendo la elaboración de perfiles que permitan mejorar los servicios ofrecidos.</li>
            <li style={{ marginBottom: '0.4rem' }}>La entrega de esta autorización es voluntaria, y su rechazo no afectará otros derechos o servicios a los que usted pueda acceder.</li>
          </ul>

          <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem', marginBottom: '0.5rem', marginTop: '1rem' }}>
            ¿Quién puede acceder a sus datos?
          </h4>
          <p style={{ marginBottom: '0.75rem' }}>
            Duoc UC se compromete a mantener la confidencialidad y seguridad de sus datos personales. No los comercializará ni los transmitirá a terceros, salvo en los siguientes casos:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>Colaboradores o prestadores de servicios específicos, únicamente cuando sea estrictamente necesario para cumplir con las finalidades antes indicadas, y siempre que estén sujetos a deberes de confidencialidad y no puedan utilizar sus datos para fines distintos a los aquí señalados.</li>
            <li style={{ marginBottom: '0.4rem' }}>Obligaciones legales: Cuando así lo exija una ley o una orden judicial debidamente emitida por los Tribunales de Justicia o por la autoridad competente.</li>
          </ul>

          <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: '#1A1A1A', fontSize: '1rem', marginBottom: '0.5rem', marginTop: '1rem' }}>
            ¿Cuáles son sus derechos?
          </h4>
          <p style={{ marginBottom: '0.75rem' }}>
            Como titular de los datos personales, usted podrá ejercer en cualquier momento los derechos otorgados por la Ley N° 19.628 y sus modificaciones, incluyendo:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>Derecho a acceder a sus datos.</li>
            <li style={{ marginBottom: '0.4rem' }}>Derecho a rectificarlos si son inexactos o incompletos.</li>
            <li style={{ marginBottom: '0.4rem' }}>Derecho a solicitar su eliminación o cancelación cuando corresponda.</li>
            <li style={{ marginBottom: '0.4rem' }}>Derecho a oponerse al tratamiento en casos justificados.</li>
            <li style={{ marginBottom: '0.4rem' }}>Derecho a revocar este consentimiento, sin efecto retroactivo, mediante solicitud escrita.</li>
          </ul>
          <p style={{ marginBottom: '0.75rem' }}>
            Para ejercer estos derechos, deberá comunicarse con el/la Delegado/a de Protección de Datos de Duoc UC, al correo electrónico <strong>gobiernodedatos@duoc.cl</strong>, quien atenderá su solicitud conforme a los plazos y requisitos establecidos por la normativa vigente.
          </p>
          <p style={{ marginBottom: '0.5rem', fontWeight: 700, color: '#1A1A1A' }}>
            Declaro haber leído y comprendido el contenido del presente consentimiento informado y otorgo mi autorización para el tratamiento de mis datos personales conforme a lo aquí señalado.
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
