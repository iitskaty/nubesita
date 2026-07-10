const mongoose = require('mongoose');

async function conectarMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI no está definida en .env — los cálculos no se guardarán en la base de datos');
    return false;
  }
  try {
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'nubesita' });
    console.log('Conectado a MongoDB (base: ' + (process.env.MONGODB_DB || 'nubesita') + ')');
    return true;
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    return false;
  }
}

const mongoDisponible = () => mongoose.connection.readyState === 1;

module.exports = { conectarMongo, mongoDisponible };
