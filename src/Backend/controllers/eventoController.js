const { PrismaClient } = require('@prisma/client');
const prisma = require('../lib/prisma');

const TIPOS = ['Japan', 'Cafeína', 'Sobremesa', 'Asesoría vocacional', 'Ventana vocacional'];

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
      data: { nombre, fecha_inicio: new Date(fecha_inicio), fecha_fin: new Date(fecha_fin), ubicacion, tipo }
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
      const d = new Date(fecha_inicio);
      if (isNaN(d)) return res.status(400).json({ error: 'fecha_inicio inválida.' });
      data.fecha_inicio = d;
    }
    if (fecha_fin !== undefined) {
      const d = new Date(fecha_fin);
      if (isNaN(d)) return res.status(400).json({ error: 'fecha_fin inválida.' });
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

module.exports = { crearEvento, obtenerEventos, obtenerEvento, actualizarEvento, obtenerEventosActivos, obtenerMisEventos };
