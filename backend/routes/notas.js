const express = require('express');
const router = express.Router();

// POST /api/notas { correo, notas: [n1, n2, ...] }
router.post('/', (req, res) => {
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

  res.json({
    correo,
    cantidad: valores.length,
    promedio: promedioRedondeado,
    estado: promedioRedondeado >= 4.0 ? 'Aprobado' : 'Reprobado',
  });
});

module.exports = router;
