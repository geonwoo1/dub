import {NotImplementedException} from "@nestjs/common";
import {ObjectIdentifier} from "@aws-sdk/client-s3/dist-types/models/models_0";

/**
 * @description s3 Base 객체
 * @author jason.jang
 * @date 2024/07/01
 **/
export class S3Base {
    /**
     * @description s3에 업로드 대상 object PreSigned url 호출
     * @author jason.jang
     * @date 2024/07/01
     **/
    async getUploadPreSignedUrl(rootPath: string): Promise<any> {throw new NotImplementedException("Not Implemented.");}

    /**
     * @description s3에 업로드 대상 object PreSigned url 호출 Public READ 권한
     * @author jason.jang
     * @date 2024/07/23
    **/
    async getUploadPreSignedUrlWithPublic(rootPath: string): Promise<any> {throw new NotImplementedException("Not Implemented.");}

    /**
     * @description s3에 다운로드 대상 object PreSigned url 생성
     * @author jason.jang
     * @date 2024/07/17
     **/
    async getDownloadPreSignedUrl(s3KeyInfo: {name: string; s3Key: string}): Promise<any> {throw new NotImplementedException("Not Implemented.");}

    /**
     * @description s3 object 복수 삭제
     * @author jason.jang
     * @date 2024/07/19
     **/
    async deleteObject(s3Key: string): Promise<void> {throw new NotImplementedException("Not Implemented.");}
    async deleteObjects(s3Keys: ObjectIdentifier[]): Promise<void> {throw new NotImplementedException("Not Implemented.");}
}
