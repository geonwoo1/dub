import {Body, Controller, Delete, Get, Post, Query, Req, Res, UseGuards} from '@nestjs/common';
import {VideoService} from './video.service';
import {Request, Response} from "express";
import {AuthGuard} from "../auth/security/auth.guard";
import {RESPONSE} from "../const/response.const";

@Controller('videos')
export class VideoController {
    constructor(
        private readonly videoService: VideoService,
    ) {}

    //비디오 업로드 할 s3 presigned url 제공
    @Get('/s3/upload-presigned-urls')
    @UseGuards(AuthGuard)
    async getUploadVideoPreSignedUrls (@Query('count') count: number, @Res() res: Response) {
        const uploadPreSignedUrlInfo: IUploadPreSignedUrlInfo = {count: 0, preSignedInfos: [{}]};
        //
        if(!(typeof count === 'number') || isNaN(count)) {
            uploadPreSignedUrlInfo.count = 1;
        }else
            uploadPreSignedUrlInfo.count = count;
        //
        uploadPreSignedUrlInfo.preSignedInfos = await this.videoService.getUploadVideoPreSignedUrls(uploadPreSignedUrlInfo.count);
        uploadPreSignedUrlInfo.count = uploadPreSignedUrlInfo.preSignedInfos.length;
        //
        return res.send({code: RESPONSE.APP.STATUS.SUCCESS, message: 'success', body: uploadPreSignedUrlInfo});
    }

    //비디오 다운로드 할 s3 presigned url 생성(Back-Office 도 사용)
    @Post('/s3/download-presigned-urls')
    @UseGuards(AuthGuard)
    async getDownloadVideosPreSignedUrls (@Body('s3Keys') s3Keys: [{name: string; s3Key: string}], @Req() req: Request, @Res() res: Response) {
        //
        return res.send({code: RESPONSE.APP.STATUS.SUCCESS
            , message: 'success'
            , body: await this.videoService.getDownloadPreSignedUrls(s3Keys)});
    }
}
