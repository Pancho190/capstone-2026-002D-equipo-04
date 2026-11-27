// src/Backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, obtenerUsuarios } = require('../controllers/authController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);
router.get('/usuarios', verificarToken, verificarAdmin, obtenerUsuarios);

module.exports = router;