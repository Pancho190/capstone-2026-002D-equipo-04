const express = require('express');
const router = express.Router();
const { crearEvento, obtenerEventos, actualizarEvento, eliminarEvento } = require('../controllers/eventoController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

router.get('/', obtenerEventos);
router.post('/', verificarToken, verificarAdmin, crearEvento);
router.put('/:id', verificarToken, verificarAdmin, actualizarEvento);
router.delete('/:id', verificarToken, verificarAdmin, eliminarEvento);

module.exports = router;
