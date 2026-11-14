export function parseCedula(text) {
  // Extraer parámetros del texto crudo (sin decodificación UTF-8 de URLSearchParams)
  const getParam = (key) => {
    const m = text.match(new RegExp(key + '=([^&]+)'));
    return m ? m[1] : '';
  };

  const run = getParam('RUN');
  const rawName = getParam('name');
  const mrz = getParam('mrz');

  // Decodificar Latin-1 (el PDF417 de la cédula chilena usa ISO-8859-1)
  const name = rawName
    .replace(/%([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, ' ')
    .trim();

  const parts = name.split(' ');
  const nombres = parts.slice(0, 2).join(' ');
  const apellido = parts.slice(2).join(' ');

  let fecha = '';
  if (mrz.length >= 16) {
    const yy = mrz.slice(10, 12);
    const mm = mrz.slice(12, 14);
    const dd = mrz.slice(14, 16);
    fecha = `20${yy}-${mm}-${dd}`;
  }

  return { rut: run, nombres, apellido, fecha };
}

export function toISODate(input) {
  if (!input) return null;
  const m = input.trim().match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2}|\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    let yyyy = m[3];
    if (yyyy.length === 2) yyyy = '20' + yyyy;
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return null;
}
