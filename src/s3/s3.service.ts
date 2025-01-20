import {Inject, Injectable} from '@nestjs/common';
import {S3Base} from "./s3.base";
import {ObjectIdentifier} from "@aws-sdk/client-s3/dist-types/models/models_0";

@Injectable()
export class S3Service {

    constructor(
        @Inject('S3_CLIENT') private readonly s3Client: S3Base,) {}

    /**
     * @description s3에 업로드 대상 object PreSigned url 호출
     * @author jason.jang
     * @date 2024/06/27
    **/
    async getUploadPreSignedUrl(rootPath: string): Promise<JSONObject> {
        return await this.s3Client.getUploadPreSignedUrl(rootPath);
    }

    /**
     * @description s3에 업로드 대상 object PreSigned url 호출 Public READ 권한
     * @author jason.jang
     * @date 2024/07/23
     **/
    async getUploadPreSignedUrlWithPublic(rootPath: string): Promise<JSONObject> {
        return await this.s3Client.getUploadPreSignedUrlWithPublic(rootPath);
    }

    /**
     * @description s3에 다운로드 대상 object PreSigned url 생성
     * @author jason.jang
     * @date 2024/07/18
    **/
    async getDownloadPreSignedUrl(s3KeyInfo: {name: string; s3Key: string}): Promise<JSONObject> {
        return await this.s3Client.getDownloadPreSignedUrl(s3KeyInfo);
    }

    /**
     * @description s3 object 삭제
     * @author jason.jang
     * @date 2024/07/19
     **/
    async deleteObject(s3Key: string): Promise<void> {
        await this.s3Client.deleteObject(s3Key);
    }

    /**
     * @description s3 object 복수 삭제
     * @author jason.jang
     * @date 2024/07/25
    **/
    async deleteObjects(s3Keys: ObjectIdentifier[]): Promise<void> {
        await this.s3Client.deleteObjects(s3Keys);
    }
}
