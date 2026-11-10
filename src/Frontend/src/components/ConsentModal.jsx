export default function ConsentModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: '1.5rem', maxWidth: 500, maxHeight: '80vh', overflowY: 'auto', margin: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem', fontFamily: 'Lato, sans-serif' }}>Consentimiento Informado</h3>
        <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
{`¿Qué significa sí, autorizo?
Al aceptar este consentimiento, usted autoriza expresamente a Duoc UC a tratar los datos personales que ha proporcionado, para los fines que se detallan a continuación:

Comunicarse con usted e informarle sobre novedades, servicios y beneficios de Duoc UC, o de entidades relacionadas, así como enviarle comunicaciones promocionales por medios electrónicos o telefónicos. Conforme al Art. 28 B de la Ley Nº 19.496, Usted podrá solicitar en cualquier momento dejar de recibir este tipo de comunicaciones.
Invitarle a participar en actividades, iniciativas, concursos y otros eventos organizados por Duoc UC.
Realizar encuestas, estudios y análisis estadísticos, incluyendo la elaboración de perfiles que permitan mejorar los servicios ofrecidos.
La entrega de esta autorización es voluntaria, y su rechazo no afectará otros derechos o servicios a los que usted pueda acceder.

¿Quién puede acceder a sus datos?
Duoc UC se compromete a mantener la confidencialidad y seguridad de sus datos personales. No los comercializará ni los transmitirá a terceros, salvo en los siguientes casos:

Colaboradores o prestadores de servicios específicos, únicamente cuando sea estrictamente necesario para cumplir con las finalidades antes indicadas, y siempre que estén sujetos a deberes de confidencialidad y no puedan utilizar sus datos para fines distintos a los aquí señalados.
Obligaciones legales: Cuando así lo exija una ley o una orden judicial debidamente emitida por los Tribunales de Justicia o por la autoridad competente.

¿Cuáles son sus derechos?
Como titular de los datos personales, usted podrá ejercer en cualquier momento los derechos otorgados por la Ley N° 19.628 y sus modificaciones, incluyendo:

Derecho a acceder a sus datos.
Derecho a rectificarlos si son inexactos o incompletos.
Derecho a solicitar su eliminación o cancelación cuando corresponda.
Derecho a oponerse al tratamiento en casos justificados.
Derecho a revocar este consentimiento, sin efecto retroactivo, mediante solicitud escrita.
Para ejercer estos derechos, deberá comunicarse con el/la Delegado/a de Protección de Datos de Duoc UC, al correo electrónico gobiernodedatos@duoc.cl, quien atenderá su solicitud conforme a los plazos y requisitos establecidos por la normativa vigente.

Declaro haber leído y comprendido el contenido del presente consentimiento informado y otorgo mi autorización para el tratamiento de mis datos personales conforme a lo aquí señalado.`}
            </p>
            <button type="button" className="primary" onClick={onClose} style={{ marginTop: '1rem' }}>
              Cerrar
            </button>
          </div>
        </div>
      );
}
