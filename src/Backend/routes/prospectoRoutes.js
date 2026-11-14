const express = require('express');
const router = express.Router();
const { crearProspecto, obtenerProspectos, exportProspectos } = require('../controllers/prospectoController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware'); // <- Sin .default

router.post('/', crearProspecto);
router.get('/', verificarToken, obtenerProspectos);
router.get('/export', verificarToken, verificarAdmin, exportProspectos);

module.exports = router;