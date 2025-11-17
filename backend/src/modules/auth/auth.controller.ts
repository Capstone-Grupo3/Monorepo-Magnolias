import { Controller, Post, Body, Get, Query, UseGuards, Req, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerificarEmailDto, ReenviarVerificacionDto } from './dto/verificacion.dto';
import { OAuthRegisterDto } from './dto/oauth-register.dto';
import { LinkedInAuthGuard } from './guards/linkedin-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login/empresa')
  @ApiOperation({ summary: 'Login de empresa' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  loginEmpresa(@Body() loginDto: LoginDto) {
    return this.authService.loginEmpresa(loginDto);
  }

  @Post('login/postulante')
  @ApiOperation({ summary: 'Login de postulante' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  loginPostulante(@Body() loginDto: LoginDto) {
    return this.authService.loginPostulante(loginDto);
  }

  @Post('verificar-email')
  @ApiOperation({ summary: 'Verificar correo electrónico' })
  @ApiResponse({ status: 200, description: 'Email verificado exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  verificarEmail(@Body() verificarEmailDto: VerificarEmailDto) {
    return this.authService.verificarEmail(verificarEmailDto.token);
  }

  @Get('verify-empresa/:token')
  @ApiOperation({ summary: 'Verificar email de empresa por URL' })
  @ApiResponse({ status: 200, description: 'Email verificado' })
  async verifyEmpresa(@Param('token') token: string) {
    const empresa = await this.authService.verificarEmailEmpresa(token);
    return { mensaje: 'Email verificado exitosamente', empresa };
  }

  @Get('verify-postulante/:token')
  @ApiOperation({ summary: 'Verificar email de postulante por URL' })
  @ApiResponse({ status: 200, description: 'Email verificado' })
  async verifyPostulante(@Param('token') token: string) {
    const postulante = await this.authService.verificarEmailPostulante(token);
    return { mensaje: 'Email verificado exitosamente', postulante };
  }

  @Post('reenviar-verificacion')
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Reenviar email de verificación' })
  @ApiResponse({ status: 200, description: 'Email reenviado' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos' })
  reenviarVerificacion(@Body() reenviarDto: ReenviarVerificacionDto) {
    return this.authService.reenviarVerificacion(reenviarDto.correo);
  }

  @Post('resend-verification/empresa/:correo')
  @ApiOperation({ summary: 'Reenviar verificación empresa' })
  async resendEmpresa(@Param('correo') correo: string) {
    await this.authService.reenviarVerificacionEmpresa(correo);
    return { mensaje: 'Correo de verificación reenviado' };
  }

  @Post('resend-verification/postulante/:correo')
  @ApiOperation({ summary: 'Reenviar verificación postulante' })
  async resendPostulante(@Param('correo') correo: string) {
    await this.authService.reenviarVerificacionPostulante(correo);
    return { mensaje: 'Correo de verificación reenviado' };
  }

  // ========== OAuth Simulado (Sin APIs externas) ==========
  
  @Get('linkedin/empresa')
  @UseGuards(LinkedInAuthGuard)
  @ApiOperation({ summary: 'Autenticación con LinkedIn - Empresa' })
  async linkedinEmpresa(@Req() req, @Res() res: Response) {
    // Passport redirige automáticamente a LinkedIn con state=empresa
    // Este método no se ejecuta en la primera llamada (redirect a LinkedIn)
  }

  @Get('linkedin/postulante')
  @UseGuards(LinkedInAuthGuard)
  @ApiOperation({ summary: 'Autenticación con LinkedIn - Postulante' })
  async linkedinPostulante(@Req() req, @Res() res: Response) {
    // Passport redirige automáticamente a LinkedIn con state=postulante
    // Este método no se ejecuta en la primera llamada (redirect a LinkedIn)
  }

  @Get('google/empresa')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Autenticación con Google - Empresa' })
  async googleEmpresa(@Req() req, @Res() res: Response) {
    // Passport redirige automáticamente a Google con state=empresa
    // Este método no se ejecuta en la primera llamada (redirect a Google)
  }

  @Get('google/postulante')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Autenticación con Google - Postulante' })
  async googlePostulante(@Req() req, @Res() res: Response) {
    // Passport redirige automáticamente a Google con state=postulante
    // Este método no se ejecuta en la primera llamada (redirect a Google)
  }

  @Get('linkedin/callback')
  @UseGuards(LinkedInAuthGuard)
  @ApiOperation({ summary: 'Callback de LinkedIn OAuth' })
  async linkedinCallback(@Req() req, @Res() res: Response) {
    // Passport ya validó y ejecutó el strategy
    // El state viene en req.query.state (devuelto por LinkedIn)
    const tipo = (req.query.state as string) || 'empresa';
    
    const result = await this.authService.loginConOAuth(req.user, tipo as 'empresa' | 'postulante');
    
    // Devolver HTML que envía el mensaje al frontend y cierra la ventana
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticación exitosa</title>
        </head>
        <body>
          <script>
            window.opener.postMessage(${JSON.stringify(result)}, "${frontendUrl}");
            window.close();
          </script>
          <p>Autenticación exitosa. Puedes cerrar esta ventana.</p>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback de Google OAuth' })
  async googleCallback(@Req() req, @Res() res: Response) {
    // Passport ya validó y ejecutó el strategy
    const tipo = (req.query.state as string) || 'empresa';
    
    const result = await this.authService.loginConOAuth(req.user, tipo as 'empresa' | 'postulante');
    
    // Devolver HTML que envía el mensaje al frontend y cierra la ventana
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticación exitosa</title>
        </head>
        <body>
          <script>
            window.opener.postMessage(${JSON.stringify(result)}, "${frontendUrl}");
            window.close();
          </script>
          <p>Autenticación exitosa. Puedes cerrar esta ventana.</p>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
