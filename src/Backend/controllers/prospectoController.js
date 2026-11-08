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

    const prospectoExistente = await prisma.prospecto.findFirst({
      where: {
        OR: [
          { rut },
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
    console.error('Error al registrar prospecto:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar el prospecto.' });
  }
};

// Listar todos los prospectos capturados
const obtenerProspectos = async (req, res) => {
  try {
    const prospectos = await prisma.prospecto.findMany({
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