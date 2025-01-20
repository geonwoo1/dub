import {Inject, Injectable} from '@nestjs/common';
import {MailBase} from "./mail.base";
import {Repository} from "typeorm";
import {MailTemplate} from "./entities/mail-template.entity";
import {IMailData} from "./interface/mail-template.interface";
import {MAIL} from "../const/mail.const";

@Injectable()
export class MailService {
    constructor(
        @Inject('MAIL') private readonly mail: MailBase,
        @Inject('MAIL_TEMPLATE_REPOSITORY') private mailTemplateRepository: Repository<MailTemplate>,
        ) {}

    /**
     * @description 메일 발송
     * @author jason.jang
     * @date 2024/07/25
    **/
    async send(data: any){
        await this.mail.send(data);
    }

    /**
     * @description 주문 생성 발송
     * @author jason.jang
     * @date 2024/07/25
    **/
    async sendCreateOrder(mailData: IMailData){
        let findMailTemplate = await this.mailTemplateRepository.findOneBy({id: MAIL.TEMPLATE.ORDER_CREATE, language: mailData.message.language?? 'ko'})
        if(!findMailTemplate)
            findMailTemplate = await this.mailTemplateRepository.findOneBy({id: MAIL.TEMPLATE.ORDER_CREATE, language: 'ko'})
        //
        mailData.message.from = mailData.message.from?? 'no-reply@iyunocloud.com';
        if(findMailTemplate){
            mailData.message.subject = this.mail.bindMailEntries(findMailTemplate.subject, mailData.entriesForBinding?.subject);
            mailData.message.title = this.mail.bindMailEntries(findMailTemplate.title, mailData.entriesForBinding?.title);
            mailData.message.content = this.mail.bindMailEntries(findMailTemplate.content, mailData.entriesForBinding?.content);
            await this.mail.send(mailData);
        }
    }

    /**
     * @description 주문 승인 발송
     * @author jason.jang
     * @date 2024/08/01
    **/
    async sendApproveOrder(mailData: IMailData){
        let findMailTemplate = await this.mailTemplateRepository.findOneBy({id: MAIL.TEMPLATE.ORDER_APPROVED, language: mailData.message.language?? 'ko'})
        if(!findMailTemplate)
            findMailTemplate = await this.mailTemplateRepository.findOneBy({id: MAIL.TEMPLATE.ORDER_APPROVED, language: 'ko'})
        //
        mailData.message.from = mailData.message.from?? 'no-reply@iyunocloud.com';
        if(findMailTemplate){
            mailData.message.subject = this.mail.bindMailEntries(findMailTemplate.subject, mailData.entriesForBinding?.subject);
            mailData.message.title = this.mail.bindMailEntries(findMailTemplate.title, mailData.entriesForBinding?.title);
            mailData.message.content = this.mail.bindMailEntries(findMailTemplate.content, mailData.entriesForBinding?.content);
            await this.mail.send(mailData);
        }
    }

    /**
     * @description 주문 수정 발송
     * @author jason.jang
     * @date 2024/08/01
     **/
    async sendModifiedOrder(mailData: IMailData){
        let findMailTemplate = await this.mailTemplateRepository.findOneBy({id: MAIL.TEMPLATE.ORDER_MODIFIED, language: mailData.message.language?? 'ko'})
        if(!findMailTemplate)
            findMailTemplate = await this.mailTemplateRepository.findOneBy({id: MAIL.TEMPLATE.ORDER_MODIFIED, language: 'ko'})
        //
        mailData.message.from = mailData.message.from?? 'no-reply@iyunocloud.com';
        if(findMailTemplate){
            mailData.message.subject = this.mail.bindMailEntries(findMailTemplate.subject, mailData.entriesForBinding?.subject);
            mailData.message.title = this.mail.bindMailEntries(findMailTemplate.title, mailData.entriesForBinding?.title);
            mailData.message.content = this.mail.bindMailEntries(findMailTemplate.content, mailData.entriesForBinding?.content);
            await this.mail.send(mailData);
        }
    }

    /**
     * @description 주문 거절 발송
     * @author jason.jang
     * @date 2024/08/01
     **/
    async sendRejectOrder(mailData: IMailData){
        let findMailTemplate = await this.mailTemplateRepository.findOneBy({id: MAIL.TEMPLATE.ORDER_REJECTED, language: mailData.message.language?? 'ko'})
        if(!findMailTemplate)
            findMailTemplate = await this.mailTemplateRepository.findOneBy({id: MAIL.TEMPLATE.ORDER_REJECTED, language: 'ko'})
        //
        mailData.message.from = mailData.message.from?? 'no-reply@iyunocloud.com';
        if(findMailTemplate){
            mailData.message.subject = this.mail.bindMailEntries(findMailTemplate.subject, mailData.entriesForBinding?.subject);
            mailData.message.title = this.mail.bindMailEntries(findMailTemplate.title, mailData.entriesForBinding?.title);
            mailData.message.content = this.mail.bindMailEntries(findMailTemplate.content, mailData.entriesForBinding?.content);
            await this.mail.send(mailData);
        }
    }

    /**
     * @description 주문 승인 발송
     * @author jason.jang
     * @date 2024/08/01
     **/
    async sendCompleteOrder(mailData: IMailData){
        let findMailTemplate = await this.mailTemplateRepository.findOneBy({id: MAIL.TEMPLATE.ORDER_COMPLETE, language: mailData.message.language?? 'ko'})
        if(!findMailTemplate)
            findMailTemplate = await this.mailTemplateRepository.findOneBy({id: MAIL.TEMPLATE.ORDER_COMPLETE, language: 'ko'})
        //
        mailData.message.from = mailData.message.from?? 'no-reply@iyunocloud.com';
        if(findMailTemplate){
            mailData.message.subject = this.mail.bindMailEntries(findMailTemplate.subject, mailData.entriesForBinding?.subject);
            mailData.message.title = this.mail.bindMailEntries(findMailTemplate.title, mailData.entriesForBinding?.title);
            mailData.message.content = this.mail.bindMailEntries(findMailTemplate.content, mailData.entriesForBinding?.content);
            await this.mail.send(mailData);
        }
    }
}