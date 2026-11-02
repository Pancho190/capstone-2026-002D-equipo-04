// src/Backend/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Registrar usuario/anfitrión
const registrarUsuario = async (req, res) => {
  try {
    const { email, password, nombre, rol, sedeId } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuarioAdmision.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El usuario ya se encuentra registrado.' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario en base de datos
    const nuevoUsuario = await prisma.usuarioAdmision.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        rol: rol || 'CAPTADOR',
        sedeId: sedeId ? parseInt(sedeId) : null
      }
    });

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: { id: nuevoUsuario.id, email: nuevoUsuario.email, nombre: nuevoUsuario.nombre }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar usuario.' });
  }
};

// Login de usuario
const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await prisma.usuarioAdmision.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Generar Token JWT (duración 12h para jornadas de admisión)
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_fallback',
      { expiresIn: '12h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor en el login.' });
  }
};

module.exports = { registrarUsuario, loginUsuario };