const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Registrar un nuevo prospecto (Captura en terreno)
const crearProspecto = async (req, res) => {
  try {
    const { rut, nombre_completo, apellidos, correo, telefono, carrera_id, evento_id, sede_id, fecha_nacimiento } = req.body;

    const usuario_id = req.usuario?.id;

    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuario no identificado en el token.' });
    }

    if (!rut || !nombre_completo) {
      return res.status(400).json({ error: 'El RUT y el nombre completo son obligatorios.' });
    }
        const rutValido = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(rut);
    if (!rutValido) {
      return res.status(400).json({ error: 'Formato de RUT inválido.' });
    }

        const prospectoExistente = await prisma.prospecto.findFirst({
      where: {
        OR: [
          evento_id ? { rut, evento_id } : { rut, evento_id: null },
          ...(correo ? [{ correo }] : [])
        ]
      }
    });

    if (prospectoExistente) {
      return res.status(400).json({ error: 'El prospecto con este RUT o correo ya se encuentra registrado.' });
    }

    const dataProspecto = {
      rut,
      nombre_completo,
      apellidos: apellidos || null,
      correo: correo || null,
      telefono: telefono || null,
      fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
      usuario: {
        connect: { id: usuario_id }
      }
    };

    if (evento_id) {
      dataProspecto.evento = { connect: { id: evento_id } };
    }
    if (carrera_id) {
      dataProspecto.carrera = { connect: { id: carrera_id } };
    }
    if (sede_id) {
      dataProspecto.sede = { connect: { id: sede_id } };
    }

    const nuevoProspecto = await prisma.prospecto.create({
      data: dataProspecto
    });

    res.status(201).json({
      mensaje: 'Prospecto capturado y guardado exitosamente',
      prospecto: nuevoProspecto
    });
      } catch (error) {
    if (error.code === 'P2003' || error.code === 'P2025') {
      return res.status(400).json({ error: 'ID de relación inválido (carrera, evento o sede).' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El prospecto ya se encuentra registrado.' });
    }
    console.error('Error al registrar prospecto:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar el prospecto.' });
  }
};

// Listar todos los prospectos capturados
const obtenerProspectos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const prospectos = await prisma.prospecto.findMany({
      skip,
      take: limit,
      include: {
        usuario: { select: { nombre_completo: true, correo: true } },
        carrera: true,
        evento: true,
        sede: true
      },
      orderBy: { fecha_captura: 'desc' }
    });

    res.json(prospectos);
  } catch (error) {
    console.error('Error al obtener prospectos:', error);
    res.status(500).json({ error: 'Error interno al obtener los prospectos.' });
  }
};

module.exports = { crearProspecto, obtenerProspectos };