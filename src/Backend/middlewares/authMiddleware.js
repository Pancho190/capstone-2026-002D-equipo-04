const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"
  if (!token) {
    return res.status(401).json({ error: 'Token malformado.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secreto_fallback');
    req.usuario = verified; // Guardamos los datos del usuario decodificados en la petición
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = { verificarToken };