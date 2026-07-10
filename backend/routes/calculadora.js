const express = require('express');
const router = express.Router();

// POST /api/calculadora { a, b, operacion }
router.post('/', (req, res) => {
  const { a, b, operacion } = req.body;
  const x = Number(a);
  const y = Number(b);

  if (Number.isNaN(x) || Number.isNaN(y)) {
    return res.status(400).json({ error: 'Los valores "a" y "b" deben ser numéricos' });
  }

  let resultado;
  switch (operacion) {
    case 'suma':
      resultado = x + y;
      break;
    case 'resta':
      resultado = x - y;
      break;
    case 'multiplicacion':
      resultado = x * y;
      break;
    case 'division':
      if (y === 0) {
        return res.status(400).json({ error: 'No se puede dividir por cero' });
      }
      resultado = x / y;
      break;
    default:
      return res.status(400).json({ error: 'Operación no válida (suma, resta, multiplicacion, division)' });
  }

  res.json({ resultado });
});

module.exports = router;
