interface IMailMessage {
    language: string;
    from?: string;
    to: string | string[];
    bcc?: string | string[];
    subject?: string;
    title?: string;
    content?: string;
}

export interface IMailData {
    message: IMailMessage;
    entriesForBinding?: {
        subject?: JSONObject,
        title?: string,
        content?: string,
    }
}