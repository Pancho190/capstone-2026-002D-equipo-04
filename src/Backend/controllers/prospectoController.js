
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearProspecto = async (req, res) => {
  try {
    const { rut, nombre_completo, correo, telefono, carreraId, eventoId } = req.body;
    
    // Obtenemos el ID del usuario desde el token decodificado
    const usuarioId = req.usuario?.id || req.usuario?.userId;

    if (!rut || !nombre_completo || !correo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para registrar el prospecto.' });
    }

    const prospectoExistente = await prisma.prospecto.findFirst({
      where: {
        OR: [{ rut }, { correo }]
      }
    });

    if (prospectoExistente) {
      return res.status(400).json({ error: 'El prospecto ya se encuentra registrado en el sistema.' });
    }

    // Creación limpia utilizando la llave foránea directa 'usuarioAdmisionId'
    const nuevoProspecto = await prisma.prospecto.create({
      data: {
        rut,
        nombre_completo,
        nombres: nombre_completo,
        correo,
        telefono: telefono || null,
        carreraId: carreraId ? parseInt(carreraId) : null,
        eventoId: eventoId ? parseInt(eventoId) : null,
        usuarioAdmisionId: parseInt(usuarioId)
      }
    });

    res.status(201).json({
      mensaje: 'Prospecto capturado y guardado exitosamente',
      prospecto: nuevoProspecto
    });
  } catch (error) {
    console.error('Error detallado al registrar prospecto:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar el prospecto.' });
  }
};

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