import {Module} from '@nestjs/common';
import {MailService} from './mail.service';
import {MailProvider, MailTemplateProviders} from "./mail.provider";
import {MailgunModule} from "nestjs-mailgun";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {DatabaseModule} from "../database/database.module";

@Module({
    imports: [DatabaseModule, MailgunModule.forAsyncRoot({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            return {
                username: configService.get<string>("MAIL.MAILGUN.DOMAIN"),
                key: configService.get<string>("MAIL.MAILGUN.SECRET"),
            };
        },
    }),],
    providers: [...MailProvider, ...MailTemplateProviders, MailService],
    exports: [MailService],
})
export class MailModule {}