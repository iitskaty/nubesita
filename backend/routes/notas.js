const express = require('express');
const router = express.Router();
const Alumno = require('../models/Alumno');
const { mongoDisponible } = require('../mongo');

// POST /api/notas { correo, notas: [n1, n2, ...] }
router.post('/', async (req, res) => {
  const { correo, notas } = req.body;

  if (typeof correo !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ error: 'Debes ingresar un correo válido' });
  }

  if (!Array.isArray(notas) || notas.length === 0) {
    return res.status(400).json({ error: 'Debes ingresar al menos una nota' });
  }

  const valores = notas.map(Number);
  if (valores.some((n) => Number.isNaN(n) || n < 1 || n > 7)) {
    return res.status(400).json({ error: 'Todas las notas deben ser numéricas y estar entre 1.0 y 7.0' });
  }

  const promedio = valores.reduce((acc, n) => acc + n, 0) / valores.length;
  const promedioRedondeado = Math.round(promedio * 10) / 10;
  const estado = promedioRedondeado >= 4.0 ? 'Aprobado' : 'Reprobado';

  let guardado = false;
  if (mongoDisponible()) {
    try {
      await Alumno.findOneAndUpdate(
        { correo: correo.toLowerCase().trim() },
        { notas: valores, promedio: promedioRedondeado, estado, fechaRegistro: new Date() },
        { upsert: true, runValidators: true }
      );
      guardado = true;
    } catch (err) {
      console.error('Error guardando en MongoDB:', err.message);
    }
  }

  res.json({
    correo,
    cantidad: valores.length,
    promedio: promedioRedondeado,
    estado,
    guardado,
  });
});

// GET /api/notas/:correo — recupera las notas guardadas de un alumno
router.get('/:correo', async (req, res) => {
  if (!mongoDisponible()) {
    return res.status(503).json({ error: 'Base de datos no disponible' });
  }
  try {
    const alumno = await Alumno.findOne({ correo: req.params.correo.toLowerCase().trim() }).lean();
    if (!alumno) {
      return res.status(404).json({ error: 'No hay notas guardadas para ese correo' });
    }
    res.json(alumno);
  } catch (err) {
    res.status(500).json({ error: 'Error consultando la base de datos' });
  }
});

module.exports = router;
