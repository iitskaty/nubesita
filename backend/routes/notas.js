const express = require('express');
const router = express.Router();

const Alumno = require('../models/Alumno');
const { mongoDisponible } = require('../mongo');
const { enviarCorreoNotas } = require('../mailer');

const NOTA_MINIMA_APROBACION = 4.0;

router.post('/', async (req, res) => {
  try {
    const { correo, notas, nombre } = req.body;

    // --- Validaciones básicas ---
    if (!correo || typeof correo !== 'string') {
      return res.status(400).json({ error: 'El correo es obligatorio' });
    }

    if (!Array.isArray(notas) || notas.length === 0) {
      return res.status(400).json({ error: 'Debes enviar al menos una nota' });
    }

    const notasNumericas = notas.map(Number);
    const notaInvalida = notasNumericas.find(
      (n) => Number.isNaN(n) || n < 1 || n > 7
    );
    if (notaInvalida !== undefined) {
      return res.status(400).json({ error: 'Las notas deben estar entre 1.0 y 7.0' });
    }

    // --- Cálculo del promedio y estado ---
    const suma = notasNumericas.reduce((acc, n) => acc + n, 0);
    const promedio = Number((suma / notasNumericas.length).toFixed(2));
    const estado = promedio >= NOTA_MINIMA_APROBACION ? 'Aprobado' : 'Reprobado';

    // --- Intentar guardar en MongoDB (si está disponible) ---
    let guardado = false;
    if (mongoDisponible()) {
      try {
        await Alumno.findOneAndUpdate(
          { correo: correo.toLowerCase().trim() },
          {
            correo,
            nombre,
            notas: notasNumericas,
            promedio,
            estado,
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true }
        );
        guardado = true;
      } catch (dbErr) {
        console.error('Error guardando alumno en Mongo:', dbErr.message);
        // No cortamos la respuesta: igual devolvemos el cálculo al frontend
      }
    } else {
      console.warn('Mongo no disponible: el cálculo no se guardará');
    }

    // --- Enviar correo con el resumen de notas ---
    let correoEnviado = false;
    try {
      correoEnviado = await enviarCorreoNotas({
        correo: correo.toLowerCase().trim(),
        nombre,
        notas: notasNumericas,
        promedio,
        estado,
      });
    } catch (mailErr) {
      console.error('Error enviando correo:', mailErr.message);
      // No cortamos la respuesta: igual devolvemos el cálculo al frontend
    }

    return res.json({
      correo,
      cantidad: notasNumericas.length,
      promedio,
      estado,
      guardado,
      correoEnviado,
    });
  } catch (err) {
    console.error('Error en /api/notas:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;