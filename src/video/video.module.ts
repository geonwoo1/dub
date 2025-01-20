import {Module} from '@nestjs/common';
import {VideoService} from './video.service';
import {VideoController} from './video.controller';
import {S3Module} from "../s3/s3.module";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [S3Module, ConfigModule],
    controllers: [VideoController],
    providers: [VideoService],
    exports: [VideoService]
})
export class VideoModule {}
