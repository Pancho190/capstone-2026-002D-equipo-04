const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const prospectoRoutes = require('./routes/prospectoRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/prospectos', prospectoRoutes);

// Ruta de prueba para verificar el backend
app.get('/', (req, res) => {
  res.json({ mensaje: '¡Servidor del Capstone Backend funcionando al 100%!' });
});

// Rutas de la API
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`[Servidor] Escuchando en el puerto http://localhost:${PORT}`);
});

