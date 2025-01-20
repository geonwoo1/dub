import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import {ConfigService} from "@nestjs/config";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {S3Base} from "./s3.base";
import {ObjectIdentifier} from "@aws-sdk/client-s3/dist-types/models/models_0";

/**
 * @description Aws 용 s3 객체
 * @author jason.jang
 * @date 2024/07/01
**/
export class S3Aws extends S3Base{
    s3Client: S3Client;
    constructor(
        private readonly configService: ConfigService,
    ) {
        super();
        this.s3Client = new S3Client({
            region: configService.get<string>('AWS.S3Base.REGION'),
            credentials: {
                accessKeyId: configService.get<string>('AWS.S3Base.ACCESS_KEY_ID'),
                secretAccessKey: configService.get<string>('AWS.S3Base.SECRET_ACCESS_KEY')
            }
        })
    }

    /**
     * @description aws s3에 업로드 대상 object PreSigned url 호출
     * @author jason.jang
     * @date 2024/06/27
     **/
    async getUploadPreSignedUrl(rootPath: string): Promise<JSONObject> {
        const today = new Date();
        const year = today.getFullYear();
        const month = ('0' + (today.getMonth() + 1)).slice(-2);
        const day = ('0' + today.getDate()).slice(-2);
        const time = Date.now();

        //MailBase 수행 작업 명시
        const s3Key = `${this.configService.get('APP.ENV')}${rootPath}/${year}/${month}-${day}/${time}`;
        const command = new PutObjectCommand({
            Bucket: this.configService.get('AWS.S3Base.BUCKET'),
            Key: s3Key,
        });

        // PreSigned URL 생성해 반환
        const preSignedUrl = await getSignedUrl(this.s3Client, command, {
            expiresIn: 1800,//30분
        });
        return {s3Key: s3Key, url: preSignedUrl};
    }

    /**
     * @description aws s3에 업로드 대상 object PreSigned url 호출 Public READ 권한
     * @author jason.jang
     * @date 2024/07/22
     **/
    async getUploadPreSignedUrlWithPublic(rootPath: string): Promise<JSONObject> {
        const today = new Date();
        const year = today.getFullYear();
        const month = ('0' + (today.getMonth() + 1)).slice(-2);
        const day = ('0' + today.getDate()).slice(-2);
        const time = Date.now();

        //MailBase 수행 작업 명시
        const s3Key = `${this.configService.get('APP.ENV')}${rootPath}/${year}/${month}-${day}/${time}`;
        const command = new PutObjectCommand({
            Bucket: this.configService.get('AWS.S3Base.BUCKET'),
            Key: s3Key,
            ACL: "public-read",
        });

        // PreSigned URL 생성해 반환
        const preSignedUrl = await getSignedUrl(this.s3Client, command, {
            expiresIn: 1800,//30분
        });
        return {s3Key: `https://${this.configService.get('AWS.S3Base.BUCKET')}.s3.amazonaws.com/${s3Key}`, url: preSignedUrl};
    }

    /**
     * @description aws s3에 다운로드 대상 object PreSigned url 생성
     * @author jason.jang
     * @date 2024/07/18
    **/
    async getDownloadPreSignedUrl(s3KeyInfo: {name: string; s3Key: string}): Promise<JSONObject> {
        //MailBase 수행 작업 명시
        const command = new GetObjectCommand({
            Bucket: this.configService.get('AWS.S3Base.BUCKET'),
            Key: s3KeyInfo.s3Key,
        });

        // PreSigned URL 생성해 반환
        const downloadPreSignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 1800 }); // 30분 유효
        return {name: s3KeyInfo.name, url: downloadPreSignedUrl};
    }

    /**
     * @description aws s3 object 삭제
     * @author jason.jang
     * @date 2024/07/19
     **/
    async deleteObject(s3Key: string): Promise<void> {
        //MailBase 수행 작업 명시
        const command: DeleteObjectCommand = new DeleteObjectCommand({
            Bucket: this.configService.get('AWS.S3Base.BUCKET'),
            Key: s3Key,
        });

        //s3 Object 삭제
        await this.s3Client.send(command);
    }

    /**
     * @description aws s3 object 복수 삭제
     * @author jason.jang
     * @date 2024/07/25
     **/
    async deleteObjects(s3Keys: ObjectIdentifier[]): Promise<void> {
        //MailBase 수행 작업 명시
        const command: DeleteObjectsCommand = new DeleteObjectsCommand({
            Bucket: this.configService.get('AWS.S3Base.BUCKET'),
            Delete: { // Delete
                Objects: s3Keys,
                Quiet: true,
            },
        });

        //s3 Object 삭제
        await this.s3Client.send(command);
    }
}
