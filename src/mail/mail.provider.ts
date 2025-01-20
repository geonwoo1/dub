import {ConfigService} from "@nestjs/config";
import {MailMailgun} from "./mail.mailgun";
import {MailgunService} from "nestjs-mailgun";
import {DataSource} from "typeorm";
import {MailTemplate} from "./entities/mail-template.entity";

export const MailProvider = [
    {
        provide: 'MAIL',
        inject: [ConfigService, MailgunService],
        useFactory: (configService: ConfigService, mailgunService: MailgunService) => {
            return new MailMailgun(configService, mailgunService);
        }
    }
]

export const MailTemplateProviders = [
    {
        provide: 'MAIL_TEMPLATE_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(MailTemplate),
        inject: ['DATA_SOURCE'],
    },
];