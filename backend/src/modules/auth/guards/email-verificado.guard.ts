import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class EmailVerificadoGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (!user.emailVerificado) {
      throw new UnauthorizedException(
        'Debes verificar tu correo electrónico antes de acceder a esta funcionalidad',
      );
    }

    return true;
  }
}
