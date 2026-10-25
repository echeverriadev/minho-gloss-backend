import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import type { AppConfig } from '../../config/configuration.js';

export interface MensajeCorreo {
  para: string;
  asunto: string;
  texto: string;
  html: string;
}

/** Envío de correos por SMTP (Mailpit en desarrollo, proveedor gratuito en producción). */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService<AppConfig, true>) {
    const mail = config.get('mail', { infer: true });
    this.from = mail.from;
    this.transporter = mail.host
      ? createTransport({
          host: mail.host,
          port: mail.port,
          secure: mail.secure,
          auth: mail.user ? { user: mail.user, pass: mail.pass } : undefined,
        })
      : null;
  }

  async enviar(mensaje: MensajeCorreo): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`SMTP_HOST no está configurado: no se envió el correo "${mensaje.asunto}"`);
      return;
    }
    await this.transporter.sendMail({
      from: this.from,
      to: mensaje.para,
      subject: mensaje.asunto,
      text: mensaje.texto,
      html: mensaje.html,
    });
  }
}
