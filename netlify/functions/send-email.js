// netlify/functions/send-email.js

const RESEND_API_URL = 'https://api.resend.com/emails';

exports.handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { nombre, email, telefono, servicio, mensaje } = data;

    if (!nombre || !email) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Faltan campos obligatorios (nombre y email).' })
      };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Falta RESEND_API_KEY en las variables de entorno de Netlify');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Configuración de servidor incompleta.' })
      };
    }

    // Ajusta estos correos a lo que tú quieras
    const toAddress = 'edetesa.mexico@gmail.com';        // donde recibes tú
    const fromAddress = 'EDETESA <no-reply@edetesa.com>'; // debe usar un dominio verificado en Resend

    const subject = `Nuevo mensaje desde la web - ${nombre}`;

    const textBody = `
Nuevo mensaje desde el formulario de contacto:

Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono || 'No proporcionado'}
Servicio: ${servicio || 'No especificado'}

Mensaje:
${mensaje || '(sin mensaje)'}
    `.trim();

    const htmlBody = `
<h2>Nuevo mensaje desde el sitio web</h2>
<p><strong>Nombre:</strong> ${nombre}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
<p><strong>Servicio:</strong> ${servicio || 'No especificado'}</p>
<p><strong>Mensaje:</strong></p>
<p>${(mensaje || '(sin mensaje)').replace(/\n/g, '<br>')}</p>
`.trim();

    const resendResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        reply_to: email, // para que puedas responder directo al cliente
        subject: subject,
        text: textBody,
        html: htmlBody
      })
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Error Resend:', resendResponse.status, errorText);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No se pudo enviar el correo.' })
      };
    }

    const resendData = await resendResponse.json();
    console.log('Resend OK:', resendData);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };

  } catch (err) {
    console.error('Error en función send-email:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error interno del servidor.' })
    };
  }
};
