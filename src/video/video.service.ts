import {Injectable} from '@nestjs/common';
import {S3Service} from "../s3/s3.service";
import {ConfigService} from "@nestjs/config";
import {ObjectIdentifier} from "@aws-sdk/client-s3/dist-types/models/models_0";

@Injectable()
export class VideoService {

    constructor(
        private readonly s3Service: S3Service,
        private configService: ConfigService
    ) {}

    /**
     * @description 비디오 업로드 할 s3 presigned url 제공(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/07/18
    **/
    async getUploadVideoPreSignedUrls(count: number): Promise<Array<JSONObject>> {
        const rootPath = this.configService.get('AWS.S3Base.VIDEO_PATH');
        const results: Array<JSONObject> = [];
        for (let idx = 1; idx <= count; idx++)
        {
            const uploadPreSignedInfo = await this.s3Service.getUploadPreSignedUrl(rootPath);
            results.push(uploadPreSignedInfo);
        }
        return results;
    }

    /**
     * @description 비디오 다운로드 할 s3 presigned url 생성(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/07/18
    **/
    async getDownloadPreSignedUrls(s3Keys: [{name: string; s3Key: string}]): Promise<Array<JSONObject>> {
        const results: Array<JSONObject> = [];
        for (const s3KeyInfo of s3Keys)
        {
            const DownloadPreSignedInfo = await this.s3Service.getDownloadPreSignedUrl(s3KeyInfo);
            results.push(DownloadPreSignedInfo);
        }
        return results;
    }

    /**
     * @description 비디오 s3 object 삭제(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/07/18
     **/
    async deleteVideoS3Object(s3Keys: string[]): Promise<void> {
        for (const s3Key of s3Keys)
        {
            await this.s3Service.deleteObject(s3Key);
        }
    }

    /**
     * @description 비디오 s3 objects 삭제(Back-Office 도 사용)
     * @author jason.jang
     * @date 2024/07/25
     **/
    async deleteVideoS3Objects(s3Keys: ObjectIdentifier[]): Promise<void> {
        await this.s3Service.deleteObjects(s3Keys);
    }
}
