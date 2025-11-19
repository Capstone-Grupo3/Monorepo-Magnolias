import { Module, forwardRef } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LinkedInStrategy } from './strategies/linkedin.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailService } from './services/email.service';
import { VerificationService } from './services/verification.service';
import { EmpresasModule } from '../empresas/empresas.module';
import { PostulantesModule } from '../postulantes/postulantes.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [
    PassportModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => EmpresasModule),
    forwardRef(() => PostulantesModule),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LinkedInStrategy,
    GoogleStrategy,
    EmailService,
    VerificationService,
  ],
  exports: [AuthService, EmailService, VerificationService],
})
export class AuthModule {}

