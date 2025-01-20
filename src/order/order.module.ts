import {Module} from '@nestjs/common';
import {OrderService} from './order.service';
import {OrderController} from './order.controller';
import {
    orderAttachedFileProviders,
    orderConfigProviders,
    orderDetailProviders,
    orderGroupProviders, orderLanguageInfoProviders,
    orderProviders
} from "./order.provider";
import {DatabaseModule} from "../database/database.module";
import {videoProviders} from "../video/video.provider";
import {LanguageModule} from "../language/language.module";
import {languageProviders} from "../language/language.provider";
import {ConfigModule} from "@nestjs/config";
import {S3Module} from "../s3/s3.module";
import {VideoModule} from "../video/video.module";
import {MailModule} from "../mail/mail.module";
import {YoutubeModule} from "../youtube/youtube.module";

@Module({
    imports: [DatabaseModule, LanguageModule, ConfigModule, S3Module, VideoModule, MailModule, YoutubeModule],
    controllers: [OrderController],
    providers: [OrderService, ...languageProviders,
        ...orderGroupProviders, ...orderProviders, ...orderDetailProviders, ...orderAttachedFileProviders,
        ...videoProviders, ...orderConfigProviders, ...orderLanguageInfoProviders],
})
export class OrderModule {
}
