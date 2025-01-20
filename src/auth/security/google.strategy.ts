import {ConfigService} from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {Profile, Strategy, VerifyCallback} from 'passport-google-oauth20';
import {AuthService} from "../auth.service";

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly configService: ConfigService
        , private readonly authService: AuthService
    ) {
        super({
            clientID: process.env.GOOGLE_API_GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_API_GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.APP_URL + process.env.GOOGLE_API_GOOGLE_OAUTH_CALLBACK_URL,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback,) {
        const user = await this.authService.validateGoogleUser(profile);
        return done(null, user);
    }
}