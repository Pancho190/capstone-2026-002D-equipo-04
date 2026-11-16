const express = require('express');
const router = express.Router();
const { crearProspecto, obtenerProspectos, exportProspectos, obtenerDuplicados } = require('../controllers/prospectoController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware'); // <- Sin .default

router.post('/', crearProspecto);
router.get('/', verificarToken, obtenerProspectos);
router.get('/export', verificarToken, verificarAdmin, exportProspectos);
router.get('/duplicados', verificarToken, verificarAdmin, obtenerDuplicados);

module.exports = router;