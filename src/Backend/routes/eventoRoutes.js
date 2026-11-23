const express = require('express');
const router = express.Router();
const { crearEvento, obtenerEventos, obtenerEvento, actualizarEvento, obtenerEventosActivos } = require('../controllers/eventoController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

router.get('/', obtenerEventos);
router.get('/activos', verificarToken, obtenerEventosActivos);
router.post('/', verificarToken, verificarAdmin, crearEvento);
router.put('/:id', verificarToken, verificarAdmin, actualizarEvento);

module.exports = router;
