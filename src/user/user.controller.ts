import {BadRequestException, Controller, Get, Param, Req, Res, UseGuards} from '@nestjs/common';
import {UserService} from './user.service';
import {Request, Response} from "express";
import {AUTH} from "../const/auth.const";
import {RESPONSE} from "../const/response.const";
import {User} from "./entities/user.entity";
import {AuthGuard} from "../auth/security/auth.guard";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    //user가 접근 가능한 youtube 채널 리스트
    @Get('/:userId/youtube-channels')
    @UseGuards(AuthGuard)
    async getAllowedUserYoutubeChannels(@Param('userId') userId: number, @Req() req: Request, @Res() res: Response) {
        const user: User = req.user as User;
        if(userId !== user.id && AUTH.ROLE.ADMIN !== user.role)
            throw new BadRequestException({code: RESPONSE.AUTH.STATUS.WRONG_USER, message: "user is wrong"});
        //
        const allowedUserYoutubeChannels = await this.userService.getAllowedUserYoutubeChannels(userId);
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: allowedUserYoutubeChannels
        });
    }

}
