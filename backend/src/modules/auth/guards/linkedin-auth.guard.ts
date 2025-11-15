import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LinkedInAuthGuard extends AuthGuard('linkedin') {
  constructor() {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const path = request.path;
    
    // Determinar el tipo según la ruta
    let tipo = 'empresa';
    if (path.includes('/postulante')) {
      tipo = 'postulante';
    }
    
    // Pasar el tipo como state para que LinkedIn lo devuelva en el callback
    return {
      state: tipo,
    };
  }
}
