import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    private readonly isEnabled: boolean;

    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/auth/google/callback';

        super({
            clientID: clientId || 'google-oauth-not-configured',
            clientSecret: clientSecret || 'google-oauth-not-configured',
            callbackURL,
            scope: ['email', 'profile'],
        });

        this.isEnabled = Boolean(clientId && clientSecret);
    }

    authenticate(req: Parameters<Strategy['authenticate']>[0], options?: Parameters<Strategy['authenticate']>[1]): void {
        if (!this.isEnabled) {
            throw new ServiceUnavailableException('Google OAuth is not configured');
        }
        super.authenticate(req, options);
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: { name: { givenName: string; familyName: string }; emails: { value: string }[]; photos: { value: string }[] },
        done: VerifyCallback,
    ): Promise<void> {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
        };

        const dbUser = await this.authService.validateGoogleUser(user);
        done(null, dbUser);
    }
}
