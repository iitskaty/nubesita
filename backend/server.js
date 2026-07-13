require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { conectarMongo } = require('./mongo');
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

// En Vercel (serverless) no se usa app.listen: se exporta la app.
// La conexión a Mongo se inicia al cargar el módulo y mongoose
// encola las consultas hasta que esté lista.
const conexionLista = conectarMongo();

if (require.main === module) {
  conexionLista.then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
