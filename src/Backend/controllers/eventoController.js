const { PrismaClient } = require('@prisma/client');
const prisma = require('../lib/prisma');

const TIPOS = ['Japan', 'Cafeína', 'Sobremesa', 'Asesoría vocacional', 'Ventana vocacional'];

// Convertir fecha local de Chile (UTC-3/UTC-4) a UTC para almacenar en la BD
function getChileOffset(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    timeZoneName: 'shortOffset'
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find(p => p.type === 'timeZoneName');
  const match = offsetPart.value.match(/GMT([+-]\d+)/);
  return match ? parseInt(match[1]) : -3;
}

function parseChileDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString + 'Z');
  const offset = getChileOffset(date);
  return new Date(date.getTime() + Math.abs(offset) * 60 * 60 * 1000);
}


const crearEvento = async (req, res) => {
  try {
    const { nombre, fecha_inicio, fecha_fin, ubicacion, tipo } = req.body;
    if (!nombre || !fecha_inicio || !fecha_fin || !tipo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }
    if (!TIPOS.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de actividad no válido.' });
    }
    const evento = await prisma.evento.create({
      data: { nombre, fecha_inicio: parseChileDate(fecha_inicio), fecha_fin: parseChileDate(fecha_fin), ubicacion, tipo }
    });
    res.status(201).json({ mensaje: 'Actividad creada', evento });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const obtenerEventos = async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({ orderBy: { fecha_inicio: 'desc' } });
    res.json(eventos);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const obtenerEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await prisma.evento.findUnique({ where: { id } });
    if (!evento) {
      return res.status(404).json({ error: 'Actividad no encontrada.' });
    }
    res.json(evento);
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const actualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, fecha_inicio, fecha_fin, ubicacion, tipo } = req.body;
    const data = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (ubicacion !== undefined) data.ubicacion = ubicacion;
    if (tipo !== undefined) {
      if (!TIPOS.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de actividad no válido.' });
      }
      data.tipo = tipo;
    }
    if (fecha_inicio !== undefined) {
      const d = parseChileDate(fecha_inicio);
      if (!d || isNaN(d)) return res.status(400).json({ error: 'fecha_inicio inv�lida.' });
      data.fecha_inicio = d;
    }
    if (fecha_fin !== undefined) {
      const d = parseChileDate(fecha_fin);
      if (!d || isNaN(d)) return res.status(400).json({ error: 'fecha_fin inv�lida.' });
      data.fecha_fin = d;
    }
    const evento = await prisma.evento.update({ where: { id }, data });
    res.json({ mensaje: 'Actividad actualizada', evento });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


const obtenerEventosActivos = async (req, res) => {
  try {
    const now = new Date();
    const eventos = await prisma.evento.findMany({
      where: {
        fecha_inicio: { lte: now },
        fecha_fin: { gte: now }
      },
      orderBy: { fecha_inicio: 'asc' }
    });
    res.json(eventos);
  } catch (error) {
    console.error('Error al obtener eventos activos:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const obtenerMisEventos = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const asignaciones = await prisma.eventoCaptador.findMany({
      where: { usuario_id },
      include: { evento: true }
    });
    const eventos = asignaciones.map((a) => a.evento);
    res.json(eventos);
  } catch (error) {
    console.error('Error al obtener mis eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const asignarCaptador = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;
    if (!usuario_id) {
      return res.status(400).json({ error: 'Falta usuario_id.' });
    }
    const asignacion = await prisma.eventoCaptador.create({
      data: { evento_id: id, usuario_id }
    });
    res.status(201).json({ mensaje: 'Captador asignado', asignacion });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El captador ya esta asignado a esta actividad.' });
    }
    console.error('Error al asignar captador:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const desasignarCaptador = async (req, res) => {
  try {
    const { id, userId } = req.params;
    await prisma.eventoCaptador.delete({
      where: { evento_id_usuario_id: { evento_id: id, usuario_id: userId } }
    });
    res.json({ mensaje: 'Captador desasignado' });
  } catch (error) {
    console.error('Error al desasignar captador:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const obtenerCaptadoresPorEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const asignaciones = await prisma.eventoCaptador.findMany({
      where: { evento_id: id },
      include: { usuario: { select: { id: true, nombre_completo: true, correo: true } } }
    });
    res.json(asignaciones.map((a) => a.usuario));
  } catch (error) {
    console.error('Error al obtener captadores:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { crearEvento, obtenerEventos, obtenerEvento, actualizarEvento, obtenerEventosActivos, obtenerMisEventos, asignarCaptador, desasignarCaptador, obtenerCaptadoresPorEvento };
