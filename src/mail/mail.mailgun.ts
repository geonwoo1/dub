import {MailBase} from "./mail.base";
import {MailgunMessageData, MailgunService} from "nestjs-mailgun";
import {ConfigService} from "@nestjs/config";
import {IMailData} from "./interface/mail-template.interface";

/**
 * @description MailGun 객체
 * @author jason.jang
 * @date 2024/07/23
**/
export class MailMailgun extends MailBase{
    constructor(private readonly configService: ConfigService,
                private mailgunService: MailgunService)
    {
        super();
    }

    /**
     * @description MailGun 발송
     * @author jason.jang
     * @date 2024/07/23
    **/
    async send(mailData: IMailData): Promise<any> {
        const mailgunMessageData: MailgunMessageData = {
            from: mailData.message.from,
            to: mailData.message.to,
            subject: mailData.message.subject,
            html: mailData.message.content,
        }
        await this.mailgunService.createEmail(this.configService.get<string>('MAIL.MAILGUN.DOMAIN'), mailgunMessageData);
    }
}
