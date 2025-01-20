import {Body, Controller, HttpStatus, Param, Post, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from "../user/dto/create-user.dto";
import {LoginUserDto} from "../user/dto/login-user.dto";
import {Request, Response} from 'express';
import {ConfigService} from "@nestjs/config";
import {AuthGuard} from "./security/auth.guard";
import {User} from "../user/entities/user.entity";
import {RESPONSE} from "../const/response.const";
import {LoginUserInfo} from "./interface/login-info.interface";

@Controller('auths')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {}

    /**
     * @description 유저 등록
     * @author jason.jang
     * @date 2024/06/28
    **/
    @Post('/register')
    async registerAccount(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
        const isSuccess = await this.authService.registerUser(createUserDto);
        const response: {code: number; message: string} = {code: RESPONSE.APP.STATUS.FAILED, message: 'Failed'}
        if(isSuccess) {
            response.code = RESPONSE.APP.STATUS.SUCCESS;
            response.message = 'success';
        }

        return res.status(HttpStatus.OK).json(response);
    }

    /**
     * @description 로그인
     * @author jason.jang
     * @date 2024/06/28
    **/
    @Post('/login')
    async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response): Promise<any> {
        const jwt = await this.authService.validateUser(loginUserDto);
        res.setHeader('Authorization', 'Bearer ' + jwt.accessToken);
        return res.status(HttpStatus.OK).json(jwt);
    }

    /**
     * @description 로그아웃
     * @author jason.jang
     * @date 2024/06/28
     **/
    @Post('/logout')
    @UseGuards(AuthGuard)
    async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
        const user = req.user as User;
        await this.authService.deleteUserTokens(user as User);
        return res.status(HttpStatus.OK).json({code: RESPONSE.APP.STATUS.SUCCESS, message: 'success'});
    }

    /**
     * @description 구글 로그인창 호출
     * @author jason.jang
     * @date 2024/07/02
    **/
    /*@Get('/google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req: Request) {
    }*/

    /**
     * @description 구글 로그인 콜백
     * @author jason.jang
     * @date 2024/07/02
    **/
    /*@Get('/google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
        const user: any = req.user;
        const jwt = await this.authService.login(user);
        res.redirect(`https://${this.configService.get<string>('FRONTEND.APP.URL')}?token=${jwt.accessToken}`);
    }*/

    /**
     * @description 프론트엔드에서 넘어온 구글 토큰 인증
     * @author jason.jang
     * @date 2024/07/02
     **/
    @Post('/google-token')
    async validateGoogleToken(@Body('token') token: string, @Res() res: Response): Promise<any> {
        const user = await this.authService.validateGoogleToken(token);
        const loginUserInfo: LoginUserInfo = await this.authService.login(user)
        return res.status(HttpStatus.OK).json({code: RESPONSE.APP.STATUS.SUCCESS, message: 'success', body: loginUserInfo });
    }

    /**
     * @description
     * @author jason.jang
     * @date 2024/07/02
     **/
    @Post('/refresh-token')
    async refreshToken(@Body('refreshToken') refreshToken: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        const loginUserInfo: LoginUserInfo = await this.authService.refreshJwtToken(refreshToken);
        return res.status(HttpStatus.OK).json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: loginUserInfo});
    }
}
