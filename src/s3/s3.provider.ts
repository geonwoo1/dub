import {ConfigModule, ConfigService} from "@nestjs/config";
import {S3Aws} from "./s3.aws";

export const S3Provider = [
    {
        provide: 'S3_CLIENT',
        import: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
            return new S3Aws(configService);
        }
    }
]