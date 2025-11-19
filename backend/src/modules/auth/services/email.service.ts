import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private emailConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = parseInt(this.configService.get<string>('EMAIL_PORT') || '587');
    const user = this.configService.get<string>('EMAIL_USER');
    const password = this.configService.get<string>('EMAIL_PASSWORD');
    const secure = this.configService.get<string>('EMAIL_SECURE') === 'true';

    if (host && port && user && password) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure, // false para puerto 587 (STARTTLS), true para 465 (SSL)
        auth: {
          user,
          pass: password,
        },
        // Configuración adicional para Gmail
        tls: {
          // No fallar en certificados inválidos (solo para desarrollo)
          rejectUnauthorized: false
        }
      });

      this.emailConfigured = true;
      this.logger.log('✅ Email service configured successfully');
      
      // Verificar la conexión
      this.transporter.verify((error) => {
        if (error) {
          this.logger.error('❌ Email service verification failed:', error);
          this.emailConfigured = false;
        } else {
          this.logger.log('✅ Email service ready to send messages');
        }
      });
    } else {
      this.logger.warn('⚠️  Email service not configured. Emails will be logged to console only.');
      this.logger.warn('   Configure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASSWORD in .env');
    }
  }

  async enviarEmailVerificacion(
    correo: string,
    nombre: string,
    token: string,
    tipoUsuario: 'empresa' | 'postulante' = 'postulante',
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const verificacionUrl = `${frontendUrl}/verificar-email/${token}?tipo=${tipoUsuario}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Verificación de Correo</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${nombre}!</h2>
            <p>Gracias por registrarte en <strong>APT Plataforma</strong>.</p>
            <p>Para completar tu registro y verificar tu correo electrónico, haz clic en el siguiente botón:</p>
            <div style="text-align: center;">
              <a href="${verificacionUrl}" class="button">Verificar mi correo</a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #6b7280;">${verificacionUrl}</p>
            <p><strong>⏰ Este enlace expira en 24 horas.</strong></p>
            <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
          </div>
          <div class="footer">
            <p>APT Plataforma - Sistema de Análisis de Postulaciones con IA</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Hola ${nombre},
      
      Gracias por registrarte en APT Plataforma.
      
      Por favor, verifica tu correo electrónico visitando el siguiente enlace:
      ${verificacionUrl}
      
      Este enlace expira en 24 horas.
      
      Si no creaste esta cuenta, puedes ignorar este correo.
    `;

    if (this.emailConfigured) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get<string>('EMAIL_FROM') || '"APT Plataforma" <noreply@apt.com>',
          to: correo,
          subject: '✅ Verifica tu correo electrónico - APT Plataforma',
          text: textContent,
          html: htmlContent,
        });
        this.logger.log(`✅ Verification email sent to ${correo}`);
      } catch (error) {
        this.logger.error(`❌ Failed to send verification email to ${correo}:`, error);
        throw new Error('No se pudo enviar el correo de verificación');
      }
    } else {
      // Modo desarrollo: mostrar en consola
      this.logger.warn(`
      ========================================
      📧 EMAIL DE VERIFICACIÓN (MODO DESARROLLO)
      ========================================
      Para: ${correo}
      Nombre: ${nombre}
      
      URL de Verificación:
      ${verificacionUrl}
      
      ⚠️  Configura las variables EMAIL_* en .env para enviar emails reales
      ========================================
      `);
    }
  }

  async enviarEmailBienvenida(correo: string, nombre: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Bienvenido!</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${nombre}!</h2>
            <p>Tu cuenta ha sido <strong>verificada exitosamente</strong> ✅</p>
            <p>Ahora puedes acceder a todas las funcionalidades de <strong>APT Plataforma</strong>:</p>
            <ul>
              <li>📋 Publicar y gestionar vacantes</li>
              <li>🤖 Análisis automático con IA</li>
              <li>📊 Rankings inteligentes de candidatos</li>
              <li>💬 Sistema de comunicación integrado</li>
            </ul>
            <p>Estamos emocionados de tenerte con nosotros.</p>
          </div>
          <div class="footer">
            <p>APT Plataforma - Sistema de Análisis de Postulaciones con IA</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      ¡Bienvenido ${nombre}!
      
      Tu cuenta ha sido verificada exitosamente.
      Ahora puedes acceder a todas las funcionalidades de APT Plataforma.
      
      Estamos emocionados de tenerte con nosotros.
    `;

    if (this.emailConfigured) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get<string>('EMAIL_FROM') || '"APT Plataforma" <noreply@apt.com>',
          to: correo,
          subject: '🎉 ¡Bienvenido a APT Plataforma!',
          text: textContent,
          html: htmlContent,
        });
        this.logger.log(`✅ Welcome email sent to ${correo}`);
      } catch (error) {
        this.logger.error(`❌ Failed to send welcome email to ${correo}:`, error);
        // No lanzar error aquí, el email de bienvenida es secundario
      }
    } else {
      this.logger.warn(`📧 Welcome email for ${nombre} (${correo}) - EMAIL SERVICE NOT CONFIGURED`);
    }
  }
}

