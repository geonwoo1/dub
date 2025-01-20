import {BadRequestException, Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy, VerifiedCallback} from "passport-jwt";
import {AuthService} from "../auth.service";
import {ConfigService} from "@nestjs/config";
import {Payload} from "../interface/payload.interface";
import {Request} from "express"
import {User} from "../../user/entities/user.entity";
import {RESPONSE} from "../../const/response.const";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private authService: AuthService,
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('APP.JWT_SECRET_KEY'),// 앞서 JWT 세팅해준 값과 동일하게 적용
            passReqToCallback: true,
        });
    }

    /**
     * @description @UseGuards(AuthGuard) 데코레이터가 추가된 곳에서 자동으로 아래 함수를 통해 유저의 토큰 검증 및 유저 객체 반환
     * @author jason.jang
     * @date 2024/06/28
    **/
    async validate(req: Request, payload: Payload, done: VerifiedCallback): Promise<any> {
        let user: User = await this.authService.validateUserJwtToken(payload);
        if(!user) {
            return done(new BadRequestException({code: RESPONSE.AUTH.STATUS.NOT_VALID, message: "token is not valid"}), false)
        }
        //
        const accessToken = req.headers.authorization.split(' ')[1];
        if(user.accessToken !== accessToken){//탈취된 refresh token 으로 생성한 access token 인 경우
            await this.authService.deleteUserTokens(user);
            return done(new BadRequestException({code: RESPONSE.AUTH.STATUS.NOT_MATCH_TOKEN, message: "token is not matched"}), false)
        }
        //
        delete user.password;

        if(req.headers["content-language"] && req.headers["content-language"] !== user.contentLanguage)
        {
            user.contentLanguage = req.headers["content-language"];
            user = await this.authService.saveUser(user, {reload: true});
        }
        user.browserTimezone = req.headers["browser-timezone"]?? 'UTC';
        return user;
    }
}