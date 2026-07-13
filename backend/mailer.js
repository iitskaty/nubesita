const nodemailer = require('nodemailer');

let transporter = null;

function mailerDisponible() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function obtenerTransporter() {
  if (!transporter && mailerDisponible()) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: (Number(process.env.SMTP_PORT) || 465) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function enviarCorreoNotas({ correo, nombre, notas, promedio, estado }) {
  const transport = obtenerTransporter();
  if (!transport) {
    console.warn('SMTP no configurado: no se enviará el correo');
    return false;
  }

  const listaNotas = notas
    .map((n, i) => `<li>Nota ${i + 1}: <strong>${n.toFixed(1)}</strong></li>`)
    .join('');

  const colorEstado = estado === 'Aprobado' ? '#2e7d32' : '#c62828';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Resumen de tus notas</h2>
      <p>Hola${nombre ? ` ${nombre}` : ''}, estas son las notas que registraste:</p>
      <ul>${listaNotas}</ul>
      <p>Promedio: <strong>${promedio.toFixed(2)}</strong></p>
      <p>Estado: <strong style="color: ${colorEstado};">${estado}</strong></p>
      <hr>
      <p style="color: #888; font-size: 12px;">Este correo fue enviado automáticamente por la API nubesita.</p>
    </div>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM || `"Nubesita" <${process.env.SMTP_USER}>`,
    to: correo,
    subject: `Tus notas: promedio ${promedio.toFixed(2)} (${estado})`,
    html,
  });

  return true;
}

module.exports = { enviarCorreoNotas, mailerDisponible };
