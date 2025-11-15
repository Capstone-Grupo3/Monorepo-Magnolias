import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(OAuth2Strategy, 'linkedin') {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    const clientID = configService.get<string>('LINKEDIN_CLIENT_ID') || 'dummy-client-id';
    const clientSecret = configService.get<string>('LINKEDIN_CLIENT_SECRET') || 'dummy-client-secret';
    const callbackURL = configService.get<string>('LINKEDIN_CALLBACK_URL') || 'http://localhost:3000/auth/linkedin/callback';

    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID,
      clientSecret,
      callbackURL,
      scope: ['openid', 'profile', 'email'],
    });

    // Verificar si OAuth está configurado
    if (clientID !== 'dummy-client-id' && clientSecret !== 'dummy-client-secret') {
      console.log('✅ LinkedIn OAuth configurado correctamente');
    } else {
      console.warn('⚠️  LinkedIn OAuth no está configurado. Configura LINKEDIN_CLIENT_ID y LINKEDIN_CLIENT_SECRET en .env');
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    try {
      // Obtener los datos del usuario usando el access token
      const response = await firstValueFrom(
        this.httpService.get('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })
      );

      const userData = response.data;

      // LinkedIn OpenID Connect devuelve los datos en formato estándar
      const user = {
        provider: 'linkedin',
        linkedinId: userData.sub, // 'sub' es el ID en OpenID Connect
        email: userData.email,
        nombre: userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim(),
        firstName: userData.given_name,
        lastName: userData.family_name,
        photo: userData.picture,
        emailVerificado: userData.email_verified || true,
        conexionesLinkedin: 0, // OpenID Connect básico no incluye conexiones
      };

      done(null, user);
    } catch (error) {
      console.error('Error al validar usuario de LinkedIn:', error.response?.data || error.message);
      done(error, null);
    }
  }
}
