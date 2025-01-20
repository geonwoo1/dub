import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {JwtModule} from '@nestjs/jwt';
import {UserModule} from "../user/user.module";
import {AuthController} from "./auth.controller";
import {ConfigModule, ConfigService} from '@nestjs/config'
import {PassportModule} from "@nestjs/passport";
import {YoutubeService} from "../youtube/youtube.service";
import {YoutubeModule} from "../youtube/youtube.module";
import {youtubeUserChannelProviders} from "../youtube/youtube.provider";
import {UserService} from "../user/user.service";


@Module({
    imports: [
        // JWT 모듈 등록
        JwtModule.registerAsync({ // 비동기적으로 JWT 모듈을 설정
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('APP.JWT_SECRET_KEY'),
            }),
        }),
        PassportModule.register({ defaultStrategy: 'google' }),
        UserModule,
        ConfigModule,
        YoutubeModule
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {
}
