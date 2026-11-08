const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Registrar usuario/anfitrión
const registrarUsuario = async (req, res) => {
  try {
    // 1. Extraemos correctamente todas las propiedades del body
    const { email, password, nombre, rol, rut } = req.body;

    // 2. Validamos si el rut está presente antes de usarlo
    if (!rut) {
      return res.status(400).json({ error: 'El campo rut es obligatorio.' });
    }

    // 3. Verificar si el usuario ya existe por su correo
    const usuarioExistente = await prisma.usuarioAdmision.findUnique({ 
      where: { correo: email } 
    });
    
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El usuario ya se encuentra registrado.' });
    }

    // 4. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Crear usuario en la base de datos
    const nuevoUsuario = await prisma.usuarioAdmision.create({
      data: {
        correo: email,
        password_hash: hashedPassword,
        nombre_completo: nombre,
        rol: 'CAPTADOR',
        rut: rut
      }
    });

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: { 
        id: nuevoUsuario.id, 
        correo: nuevoUsuario.correo, 
        nombre: nuevoUsuario.nombre_completo,
        rut: nuevoUsuario.rut 
      }
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

    const usuario = await prisma.usuarioAdmision.findUnique({ where: { correo: email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: { id: usuario.id, correo: usuario.correo, nombre: usuario.nombre_completo, rol: usuario.rol }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor en el login.' });
  }
};

module.exports = { registrarUsuario, loginUsuario };