const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar el backend
app.get('/', (req, res) => {
  res.json({ mensaje: '¡Servidor del Capstone Backend funcionando al 100%! 🚀' });
});

app.listen(PORT, () => {
  console.log(`[Servidor] Escuchando en el puerto http://localhost:${PORT}`);
});