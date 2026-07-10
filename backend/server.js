require('dotenv').config();
const express = require('express');
const cors = require('cors');

const calculadoraRoutes = require('./routes/calculadora');
const notasRoutes = require('./routes/notas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API nubesita funcionando' });
});

app.use('/api/calculadora', calculadoraRoutes);
app.use('/api/notas', notasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
