import {NotImplementedException} from "@nestjs/common";
import {MailgunMessageData} from "nestjs-mailgun";

/**
 * @description Mail Base 객체
 * @author jason.jang
 * @date 2024/07/23
 **/
export class MailBase {
    /**
     * @description MailGun 발송
     * @author jason.jang
     * @date 2024/07/23
     **/
    async send(mailData: any): Promise<any> {throw new NotImplementedException("Not Implemented.");}

    /**
     * @description 메일 데이터 바인딩
     * @author jason.jang
     * @date 2024/07/30
    **/
    bindMailEntries(target, entriesForBinding) {
        if(!entriesForBinding)
            return target;

        const variables = Object.entries(entriesForBinding);

        // 변수들을 하나씩 순회하며 target 문자열에서 해당 변수를 치환
        for (const [key, value] of variables) {
            const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
            target = target.replace(regex, value);
        }

        return target;
    }
}
