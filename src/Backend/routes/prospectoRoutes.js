const express = require('express');
const router = express.Router();
const { crearProspecto, obtenerProspectos } = require('../controllers/prospectoController');
const { verificarToken } = require('../middlewares/authMiddleware'); // <- Sin .default

router.post('/', verificarToken, crearProspecto);
router.get('/', verificarToken, obtenerProspectos);

module.exports = router;