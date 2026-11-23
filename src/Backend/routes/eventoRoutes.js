const express = require('express');
const router = express.Router();
const { crearEvento, obtenerEventos, obtenerEvento, actualizarEvento, obtenerEventosActivos, obtenerMisEventos } = require('../controllers/eventoController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

router.get('/', obtenerEventos);
router.get('/activos', verificarToken, obtenerEventosActivos);
router.get('/mis', verificarToken, obtenerMisEventos);
router.post('/', verificarToken, verificarAdmin, crearEvento);
router.put('/:id', verificarToken, verificarAdmin, actualizarEvento);

module.exports = router;
