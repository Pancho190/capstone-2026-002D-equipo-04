const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Registrar un nuevo prospecto (Captura en terreno)
const crearProspecto = async (req, res) => {
  try {
    const { rut, nombre_completo, correo, telefono, carreraId, eventoId } = req.body;
    const usuarioAdmisionId = req.usuario.id; // Obtenido del token JWT del captador autenticado

    // Validar campos obligatorios mínimos
    if (!rut || !nombre_completo || !correo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para registrar el prospecto.' });
    }

    // Verificar si el prospecto ya existe por RUT o correo
    const prospectoExistente = await prisma.prospecto.findFirst({
      where: {
        OR: [{ rut }, { correo }]
      }
    });

    if (prospectoExistente) {
      return res.status(400).json({ error: 'El prospecto ya se encuentra registrado en el sistema.' });
    }

    // Crear el prospecto vinculado al usuario que lo capturó
    const nuevoProspecto = await prisma.prospecto.create({
      data: {
        rut,
        nombre_completo,
        correo,
        telefono,
        carreraId: carreraId ? parseInt(carreraId) : null,
        eventoId: eventoId ? parseInt(eventoId) : null,
        usuarioAdmisionId: parseInt(usuarioAdmisionId)
      }
    });

    res.status(201).json({
      mensaje: 'Prospecto capturado y guardado exitosamente',
      prospecto: nuevoProspecto
    });
  } catch (error) {
    console.error('Error al registrar prospecto:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar el prospecto.' });
  }
};

// Listar todos los prospectos capturados
const obtenerProspectos = async (req, res) => {
  try {
    const prospectos = await prisma.prospecto.findMany({
      include: {
        usuarioAdmision: { select: { nombre_completo: true, correo: true } },
        carrera: true,
        evento: true
      },
      orderBy: { fecha_registro: 'desc' }
    });

    res.json(prospectos);
  } catch (error) {
    console.error('Error al obtener prospectos:', error);
    res.status(500).json({ error: 'Error interno al obtener los prospectos.' });
  }
};

module.exports = { crearProspecto, obtenerProspectos };