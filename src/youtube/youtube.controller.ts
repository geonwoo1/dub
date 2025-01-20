import {Controller, Get, Query, Req, Res, UseGuards} from '@nestjs/common';
import {YoutubeService} from './youtube.service';
import {AuthGuard} from "../auth/security/auth.guard";
import {Request, Response} from "express";
import {RESPONSE} from "../const/response.const";
import {YoutubeFilter} from "./interface/youtube-filter.interface";
import {YoutubeChannelLog} from "./entities/youtube-channel-log.entity";

@Controller('youtubes')
export class YoutubeController {
    constructor(private readonly youtubeService: YoutubeService) {}

    //Youtube 채널 리스트(Back-Office 도 사용)
    @Get('/channels')
    @UseGuards(AuthGuard)
    async getYoutubeChannels(@Query('channelName') channelName: string,
                             @Req() req: Request, @Res() res: Response) {
        const filter: YoutubeFilter = {channelName: channelName};
        const youtubeChannelLogs: YoutubeChannelLog[] = await this.youtubeService.getYoutubeChannels(filter);
        return res.json({
            code: RESPONSE.APP.STATUS.SUCCESS,
            message: 'success',
            body: youtubeChannelLogs
        });
    }
}
