import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmpresasService } from '../empresas/empresas.service';
import { PostulantesService } from '../postulantes/postulantes.service';
import { EmailService } from './services/email.service';
import { VerificationService } from './services/verification.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private empresasService: EmpresasService,
    private postulantesService: PostulantesService,
    private emailService: EmailService,
    private verificationService: VerificationService,
  ) {}

  async loginEmpresa(loginDto: LoginDto) {
    const empresa = await this.empresasService.findByEmail(loginDto.correo);

    if (
      !empresa ||
      !empresa.contrasenaHash ||
      !(await bcrypt.compare(loginDto.contrasena, empresa.contrasenaHash))
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      sub: empresa.id, 
      email: empresa.correo, 
      tipo: 'empresa',
      emailVerificado: empresa.emailVerificado 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: empresa.id,
        nombre: empresa.nombre,
        correo: empresa.correo,
        tipo: 'empresa',
        emailVerificado: empresa.emailVerificado,
      },
    };
  }

  async loginPostulante(loginDto: LoginDto) {
    const postulante = await this.postulantesService.findByEmail(loginDto.correo);

    if (
      !postulante ||
      !postulante.contrasenaHash ||
      !(await bcrypt.compare(loginDto.contrasena, postulante.contrasenaHash))
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: postulante.id,
      email: postulante.correo,
      tipo: 'postulante',
      emailVerificado: postulante.emailVerificado,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: postulante.id,
        nombre: postulante.nombre,
        correo: postulante.correo,
        tipo: 'postulante',
        emailVerificado: postulante.emailVerificado,
      },
    };
  }

  async validateUser(userId: number, tipo: string) {
    if (tipo === 'empresa') {
      return this.empresasService.findOne(userId);
    } else if (tipo === 'postulante') {
      return this.postulantesService.findOne(userId);
    }
    return null;
  }

  async verificarEmail(token: string) {
    // Buscar en empresas
    let empresa = await this.prisma.empresa.findUnique({
      where: { tokenVerificacion: token },
    });

    if (empresa) {
      // Verificar expiración
      if (
        !empresa.tokenExpiracion ||
        this.verificationService.tokenExpirado(empresa.tokenExpiracion)
      ) {
        throw new BadRequestException(
          'El token de verificación ha expirado. Por favor, solicita un nuevo email de verificación.',
        );
      }

      // Actualizar empresa
      await this.prisma.empresa.update({
        where: { id: empresa.id },
        data: {
          emailVerificado: true,
          tokenVerificacion: null,
          tokenExpiracion: null,
        },
      });

      await this.emailService.enviarEmailBienvenida(
        empresa.correo,
        empresa.nombre,
      );

      return { mensaje: 'Email verificado exitosamente', tipo: 'empresa' };
    }

    // Buscar en postulantes
    let postulante = await this.prisma.postulante.findUnique({
      where: { tokenVerificacion: token },
    });

    if (postulante) {
      // Verificar expiración
      if (
        !postulante.tokenExpiracion ||
        this.verificationService.tokenExpirado(postulante.tokenExpiracion)
      ) {
        throw new BadRequestException(
          'El token de verificación ha expirado. Por favor, solicita un nuevo email de verificación.',
        );
      }

      // Actualizar postulante
      await this.prisma.postulante.update({
        where: { id: postulante.id },
        data: {
          emailVerificado: true,
          tokenVerificacion: null,
          tokenExpiracion: null,
        },
      });

      await this.emailService.enviarEmailBienvenida(
        postulante.correo,
        postulante.nombre,
      );

      return { mensaje: 'Email verificado exitosamente', tipo: 'postulante' };
    }

    throw new NotFoundException('Token de verificación inválido');
  }

  async reenviarVerificacion(correo: string) {
    // Buscar en empresas
    let empresa = await this.empresasService.findByEmail(correo);

    if (empresa) {
      if (empresa.emailVerificado) {
        throw new BadRequestException('El email ya está verificado');
      }

      const token = this.verificationService.generarToken();
      const expiracion = this.verificationService.calcularExpiracion();

      await this.prisma.empresa.update({
        where: { id: empresa.id },
        data: {
          tokenVerificacion: token,
          tokenExpiracion: expiracion,
        },
      });

      await this.emailService.enviarEmailVerificacion(
        empresa.correo,
        empresa.nombre,
        token,
        'empresa',
      );

      return { mensaje: 'Email de verificación reenviado' };
    }

    // Buscar en postulantes
    let postulante = await this.postulantesService.findByEmail(correo);

    if (postulante) {
      if (postulante.emailVerificado) {
        throw new BadRequestException('El email ya está verificado');
      }

      const token = this.verificationService.generarToken();
      const expiracion = this.verificationService.calcularExpiracion();

      await this.prisma.postulante.update({
        where: { id: postulante.id },
        data: {
          tokenVerificacion: token,
          tokenExpiracion: expiracion,
        },
      });

      await this.emailService.enviarEmailVerificacion(
        postulante.correo,
        postulante.nombre,
        token,
        'postulante',
      );

      return { mensaje: 'Email de verificación reenviado' };
    }

    throw new NotFoundException('No se encontró una cuenta con ese correo');
  }

  async verificarEmailEmpresa(token: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { tokenVerificacion: token },
    });

    if (!empresa) {
      throw new NotFoundException('Token de verificación inválido');
    }

    if (
      !empresa.tokenExpiracion ||
      this.verificationService.tokenExpirado(empresa.tokenExpiracion)
    ) {
      throw new BadRequestException(
        'El token de verificación ha expirado. Por favor, solicita un nuevo email de verificación.',
      );
    }

    await this.prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        emailVerificado: true,
        tokenVerificacion: null,
        tokenExpiracion: null,
      },
    });

    await this.emailService.enviarEmailBienvenida(
      empresa.correo,
      empresa.nombre,
    );

    return empresa;
  }

  async verificarEmailPostulante(token: string) {
    const postulante = await this.prisma.postulante.findUnique({
      where: { tokenVerificacion: token },
    });

    if (!postulante) {
      throw new NotFoundException('Token de verificación inválido');
    }

    if (
      !postulante.tokenExpiracion ||
      this.verificationService.tokenExpirado(postulante.tokenExpiracion)
    ) {
      throw new BadRequestException(
        'El token de verificación ha expirado. Por favor, solicita un nuevo email de verificación.',
      );
    }

    await this.prisma.postulante.update({
      where: { id: postulante.id },
      data: {
        emailVerificado: true,
        tokenVerificacion: null,
        tokenExpiracion: null,
      },
    });

    await this.emailService.enviarEmailBienvenida(
      postulante.correo,
      postulante.nombre,
    );

    return postulante;
  }

  async reenviarVerificacionEmpresa(correo: string) {
    const empresa = await this.empresasService.findByEmail(correo);

    if (!empresa) {
      throw new NotFoundException('No se encontró una empresa con ese correo');
    }

    if (empresa.emailVerificado) {
      throw new BadRequestException('El email ya está verificado');
    }

    const token = this.verificationService.generarToken();
    const expiracion = this.verificationService.calcularExpiracion();

    await this.prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        tokenVerificacion: token,
        tokenExpiracion: expiracion,
      },
    });

    await this.emailService.enviarEmailVerificacion(
      empresa.correo,
      empresa.nombre,
      token,
      'empresa',
    );

    return { mensaje: 'Email de verificación reenviado' };
  }

  async reenviarVerificacionPostulante(correo: string) {
    const postulante = await this.postulantesService.findByEmail(correo);

    if (!postulante) {
      throw new NotFoundException('No se encontró un postulante con ese correo');
    }

    if (postulante.emailVerificado) {
      throw new BadRequestException('El email ya está verificado');
    }

    const token = this.verificationService.generarToken();
    const expiracion = this.verificationService.calcularExpiracion();

    await this.prisma.postulante.update({
      where: { id: postulante.id },
      data: {
        tokenVerificacion: token,
        tokenExpiracion: expiracion,
      },
    });

    await this.emailService.enviarEmailVerificacion(
      postulante.correo,
      postulante.nombre,
      token,
      'postulante',
    );

    return { mensaje: 'Email de verificación reenviado' };
  }

  async registrarConOAuth(
    oauthData: any,
    tipo: 'empresa' | 'postulante',
    datosAdicionales: any,
  ) {
    // Validar conexiones de LinkedIn si corresponde
    if (
      oauthData.linkedinId &&
      oauthData.conexionesLinkedin !== undefined
    ) {
      if (
        !this.verificationService.validarConexionesLinkedin(
          oauthData.conexionesLinkedin,
        )
      ) {
        throw new BadRequestException(
          'Tu cuenta de LinkedIn debe tener al menos 10 conexiones para registrarte',
        );
      }
    }

    const token = this.verificationService.generarToken();
    const expiracion = this.verificationService.calcularExpiracion();

    const datosRegistro = {
      ...datosAdicionales,
      correo: oauthData.email,
      nombre: oauthData.nombre,
      linkedinId: oauthData.linkedinId,
      googleId: oauthData.googleId,
      conexionesLinkedin: oauthData.conexionesLinkedin,
      emailVerificado: oauthData.emailVerificado || false,
      tokenVerificacion: token,
      tokenExpiracion: expiracion,
    };

    let usuario;
    if (tipo === 'empresa') {
      usuario = await this.empresasService.create(datosRegistro);
    } else {
      usuario = await this.postulantesService.create(datosRegistro);
    }

    // Enviar email de verificación solo si no está verificado
    if (!oauthData.emailVerificado) {
      await this.emailService.enviarEmailVerificacion(
        usuario.correo,
        usuario.nombre,
        token,
        tipo,
      );
    }

    return usuario;
  }

  async loginConOAuth(oauthUser: any, tipo: 'empresa' | 'postulante') {
    // Buscar usuario existente por linkedinId o googleId
    let usuario;
    
    if (tipo === 'empresa') {
      if (oauthUser.linkedinId) {
        usuario = await this.prisma.empresa.findUnique({
          where: { linkedinId: oauthUser.linkedinId },
        });
      } else if (oauthUser.googleId) {
        usuario = await this.prisma.empresa.findUnique({
          where: { googleId: oauthUser.googleId },
        });
      }
      
      // Si no existe, buscar por email
      if (!usuario && oauthUser.email) {
        usuario = await this.prisma.empresa.findUnique({
          where: { correo: oauthUser.email },
        });
      }
      
      // Si no existe, crear nuevo usuario
      if (!usuario) {
        usuario = await this.prisma.empresa.create({
          data: {
            nombre: oauthUser.nombre,
            correo: oauthUser.email,
            rut: '', // Se puede pedir después
            linkedinId: oauthUser.linkedinId,
            googleId: oauthUser.googleId,
            emailVerificado: true,
          },
        });
      } else {
        // Actualizar linkedinId/googleId si no está guardado
        await this.prisma.empresa.update({
          where: { id: usuario.id },
          data: {
            linkedinId: oauthUser.linkedinId || usuario.linkedinId,
            googleId: oauthUser.googleId || usuario.googleId,
            emailVerificado: true,
          },
        });
      }
    } else {
      if (oauthUser.linkedinId) {
        usuario = await this.prisma.postulante.findUnique({
          where: { linkedinId: oauthUser.linkedinId },
        });
      } else if (oauthUser.googleId) {
        usuario = await this.prisma.postulante.findUnique({
          where: { googleId: oauthUser.googleId },
        });
      }
      
      // Si no existe, buscar por email
      if (!usuario && oauthUser.email) {
        usuario = await this.prisma.postulante.findUnique({
          where: { correo: oauthUser.email },
        });
      }
      
      // Si no existe, crear nuevo usuario
      if (!usuario) {
        usuario = await this.prisma.postulante.create({
          data: {
            nombre: oauthUser.nombre,
            correo: oauthUser.email,
            rut: '', // Se puede pedir después
            linkedinId: oauthUser.linkedinId,
            googleId: oauthUser.googleId,
            emailVerificado: true,
          },
        });
      } else {
        // Actualizar linkedinId/googleId si no está guardado
        await this.prisma.postulante.update({
          where: { id: usuario.id },
          data: {
            linkedinId: oauthUser.linkedinId || usuario.linkedinId,
            googleId: oauthUser.googleId || usuario.googleId,
            emailVerificado: true,
          },
        });
      }
    }

    // Generar JWT
    const payload = {
      sub: usuario.id,
      email: usuario.correo,
      tipo,
      emailVerificado: true,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo,
        emailVerificado: true,
      },
    };
  }
}
