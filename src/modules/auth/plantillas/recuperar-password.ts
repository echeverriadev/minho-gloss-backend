import type { MensajeCorreo } from '../../../common/mail/mail.service.js';
import { escapeHtml } from '../../../common/mail/escape-html.js';

export function correoRecuperarPassword(datos: {
  para: string;
  nombre: string;
  enlace: string;
  minutos: number;
}): MensajeCorreo {
  const { para, nombre, enlace, minutos } = datos;
  return {
    para,
    asunto: 'Recupera tu contraseña de Minho Gloss',
    texto: [
      `Hola ${nombre}:`,
      '',
      'Recibimos un pedido para cambiar la contraseña de tu cuenta de Minho Gloss.',
      `Para elegir una nueva, abre este enlace (vence en ${minutos} minutos):`,
      enlace,
      '',
      'Si no lo pediste, ignora este correo: tu contraseña no cambia.',
    ].join('\n'),
    html: `<p>Hola ${escapeHtml(nombre)}:</p>
<p>Recibimos un pedido para cambiar la contraseña de tu cuenta de Minho Gloss.</p>
<p><a href="${escapeHtml(enlace)}" style="display:inline-block;padding:12px 20px;background:#1d4ed8;color:#ffffff;border-radius:8px;text-decoration:none">Elegir una contraseña nueva</a></p>
<p>El enlace vence en ${minutos} minutos y sirve una sola vez.</p>
<p>Si no lo pediste, ignora este correo: tu contraseña no cambia.</p>`,
  };
}
