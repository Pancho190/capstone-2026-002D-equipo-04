const prisma = require('../lib/prisma');

// Registrar un nuevo prospecto (Captura en terreno)
const crearProspecto = async (req, res) => {
  try {
   const { rut, nombre_completo, apellidos, genero, correo, telefono, carrera_id, evento_id, sede_id, fecha_nacimiento, anio_curso, region, comuna, identificacion, escuela, carrera_interes, sede_preferencia } = req.body;
    const usuario_id = req.usuario?.id || null;

    if (!rut || !nombre_completo) {
      return res.status(400).json({ error: 'El RUT y el nombre completo son obligatorios.' });
    }

    // Validar ventana de tiempo si se asocia a una actividad
    if (evento_id) {
      const evento = await prisma.evento.findUnique({ where: { id: evento_id } });
      if (!evento) {
        return res.status(404).json({ error: 'Actividad no encontrada.' });
      }
      const now = new Date();
      if (now < new Date(evento.fecha_inicio) || now > new Date(evento.fecha_fin)) {
        return res.status(400).json({ error: 'La actividad no está disponible en este momento.' });
      }
    }
        const rutValido = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(rut);
    if (!rutValido) {
      return res.status(400).json({ error: 'Formato de RUT inválido.' });
    }

        const prospectoExistente = await prisma.prospecto.findFirst({
      where: {
        OR: [
          evento_id ? { rut, evento_id } : { rut, evento_id: null },
          ...(correo ? [evento_id ? { correo, evento_id } : { correo, evento_id: null }] : [])
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
      genero: genero || null,
      correo: correo || null,
      telefono: telefono || null,
      anio_curso: anio_curso || null,
      region: region || null,
      comuna: comuna || null,
      identificacion: identificacion || null,
      escuela: escuela || null,
      carrera_interes: carrera_interes || null,
      sede_preferencia: sede_preferencia || null,
      fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
      ...(usuario_id ? { usuario: { connect: { id: usuario_id } } } : {})
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
    const { desde, hasta, evento_id, tipo, mes, dia, periodo } = req.query;

    const where = {};
    if (evento_id) where.evento_id = evento_id;
    if (tipo) where.evento = { tipo };
    if (periodo) {
      const captureYear = parseInt(periodo) - 1;
      where.fecha_captura = {
        gte: new Date(`${captureYear}-01-01`),
        lte: new Date(`${captureYear}-12-31T23:59:59`)
      };
    }
    if (desde || hasta) {
      if (!where.fecha_captura) where.fecha_captura = {};
      if (desde) where.fecha_captura.gte = new Date(desde);
      if (hasta) where.fecha_captura.lte = new Date(hasta);
    }

    let prospectos = await prisma.prospecto.findMany({
      where,
      include: {
        usuario: { select: { nombre_completo: true, correo: true } },
        carrera: true,
        evento: true,
        sede: true
      },
      orderBy: { fecha_captura: 'desc' }
    });

    if (mes || dia) {
      prospectos = prospectos.filter((p) => {
        const d = new Date(p.fecha_captura);
        if (mes && d.getMonth() + 1 !== parseInt(mes)) return false;
        if (dia && d.getDate() !== parseInt(dia)) return false;
        return true;
      });
    }

    const total = prospectos.length;
    const skip = (page - 1) * limit;
    const paginated = prospectos.slice(skip, skip + limit);

    res.json({ data: paginated, total, page, limit });
  } catch (error) {
    console.error('Error al obtener prospectos:', error);
    res.status(500).json({ error: 'Error interno al obtener los prospectos.' });
  }
};

const exportProspectos = async (req, res) => {
  try {
    const { desde, hasta, evento_id, tipo, mes, dia, periodo } = req.query;
    const where = {};
    if (evento_id) where.evento_id = evento_id;
    if (tipo) where.evento = { tipo };
    if (periodo) {
      const captureYear = parseInt(periodo) - 1;
      where.fecha_captura = {
        gte: new Date(`${captureYear}-01-01`),
        lte: new Date(`${captureYear}-12-31T23:59:59`)
      };
    }
    if (desde || hasta) {
      if (!where.fecha_captura) where.fecha_captura = {};
      if (desde) where.fecha_captura.gte = new Date(desde);
      if (hasta) where.fecha_captura.lte = new Date(hasta);
    }

    let prospectos = await prisma.prospecto.findMany({
      where,
      include: { evento: true, usuario: { select: { nombre_completo: true } } },
      orderBy: { fecha_captura: 'desc' }
    });

    if (mes || dia) {
      prospectos = prospectos.filter((p) => {
        const d = new Date(p.fecha_captura);
        if (mes && d.getMonth() + 1 !== parseInt(mes)) return false;
        if (dia && d.getDate() !== parseInt(dia)) return false;
        return true;
      });
    }

    const header = 'RUT,Nombre,Apellido,Correo,Telefono,Fecha Nacimiento,Actividad,Tipo,Fecha Captura\n';
    const rows = prospectos.map((p) => {
      return [
        p.rut,
        p.nombre_completo,
        p.apellidos || '',
        p.correo || '',
        p.telefono || '',
        p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toISOString().split('T')[0] : '',
        p.evento?.nombre || '',
        p.evento?.tipo || '',
        new Date(p.fecha_captura).toISOString().split('T')[0]
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=prospectos.csv');
    res.send(header + rows);
  } catch (error) {
    console.error('Error al exportar prospectos:', error);
    res.status(500).json({ error: 'Error interno al exportar.' });
  }
};
const obtenerDuplicados = async (req, res) => {
  try {
    const prospectos = await prisma.prospecto.findMany({
      include: { evento: { select: { id: true, nombre: true, fecha_inicio: true } } },
      orderBy: { fecha_captura: 'asc' }
    });

    // Agrupar por RUT
    const byRut = {};
    for (const p of prospectos) {
      if (!byRut[p.rut]) byRut[p.rut] = [];
      byRut[p.rut].push(p);
    }

    // Filtrar RUTs que aparecen en más de una actividad distinta
    const duplicados = [];
    for (const rut in byRut) {
      const grupo = byRut[rut];
      const eventosDistintos = new Set(grupo.map((p) => p.evento_id).filter(Boolean));
      if (eventosDistintos.size > 1) {
        duplicados.push({
          rut,
          nombre: grupo[0].nombre_completo,
          actividades: grupo.map((p) => ({
            nombre: p.evento?.nombre || 'Sin actividad',
            fecha: p.evento?.fecha_inicio || p.fecha_captura
          })),
          primera_captura: grupo[0].fecha_captura
        });
      }
    }

    res.json(duplicados);
  } catch (error) {
    console.error('Error al obtener duplicados:', error);
    res.status(500).json({ error: 'Error interno al obtener duplicados.' });
  }
};
const obtenerMisProspectos = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const prospectos = await prisma.prospecto.findMany({
      where: { usuario_id },
      include: { evento: true, carrera: true, sede: true },
      orderBy: { fecha_captura: 'desc' }
    });
    res.json({ data: prospectos, total: prospectos.length });
  } catch (error) {
    console.error('Error al obtener mis prospectos:', error);
    res.status(500).json({ error: 'Error interno al obtener prospectos.' });
  }
};

const obtenerInscritosPorEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const prospectos = await prisma.prospecto.findMany({
      where: { evento_id: id },
      include: { usuario: { select: { nombre_completo: true, correo: true } }, carrera: true, sede: true },
      orderBy: { fecha_captura: 'desc' }
    });
    res.json({ data: prospectos, total: prospectos.length });
  } catch (error) {
    console.error('Error al obtener inscritos:', error);
    res.status(500).json({ error: 'Error interno al obtener inscritos.' });
  }
};

module.exports = { crearProspecto, obtenerProspectos, exportProspectos, obtenerDuplicados, obtenerMisProspectos, obtenerInscritosPorEvento };