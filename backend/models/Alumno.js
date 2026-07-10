const mongoose = require('mongoose');

const alumnoSchema = new mongoose.Schema(
  {
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    nombre: { type: String, trim: true },
    notas: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0 && arr.every((n) => n >= 1 && n <= 7),
        message: 'Las notas deben estar entre 1.0 y 7.0',
      },
    },
    promedio: { type: Number, required: true, min: 1, max: 7 },
    estado: { type: String, enum: ['Aprobado', 'Reprobado'], required: true },
    fechaRegistro: { type: Date, default: Date.now },
  },
  { collection: 'alumnos' }
);

module.exports = mongoose.model('Alumno', alumnoSchema);
