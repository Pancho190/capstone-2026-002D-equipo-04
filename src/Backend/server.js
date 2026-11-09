const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const prospectoRoutes = require('./routes/prospectoRoutes');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use('/api/prospectos', prospectoRoutes);

// Ruta de prueba para verificar el backend
app.get('/', (req, res) => {
  res.json({ mensaje: '¡Servidor del Capstone Backend funcionando al 100%!' });
});

// Rutas de la API
app.use('/api/auth', authRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Servidor] Escuchando en el puerto http://localhost:${PORT}`);
  });
}

module.exports = app;