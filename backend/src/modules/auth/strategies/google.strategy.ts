import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID') || 'dummy-client-id';
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET') || 'dummy-client-secret';
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/auth/google/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email'],
    });

    // Verificar si OAuth está configurado
    if (clientID !== 'dummy-client-id' && clientSecret !== 'dummy-client-secret') {
      console.log('✅ Google OAuth configurado correctamente');
    } else {
      console.warn('⚠️  Google OAuth no está configurado. Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env');
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails, displayName, name, photos } = profile;

      // Extraer información del perfil de Google
      const user = {
        provider: 'google',
        googleId: id,
        email: emails?.[0]?.value,
        nombre: displayName || `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
        firstName: name?.givenName,
        lastName: name?.familyName,
        photo: photos?.[0]?.value,
        emailVerificado: emails?.[0]?.verified || true, // Google verifica emails
        accessToken,
      };

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
