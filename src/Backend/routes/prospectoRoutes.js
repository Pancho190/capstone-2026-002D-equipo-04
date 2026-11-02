const express = require('express');
const router = express.Router();
const { crearProspecto, obtenerProspectos } = require('../controllers/prospectoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Todas estas rutas están protegidas con el middleware de autenticación JWT
router.post('/', verificarToken, crearProspecto);
router.get('/', verificarToken, obtenerProspectos);

module.exports = router;