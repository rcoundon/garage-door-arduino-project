"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSender = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
class EmailSender {
    static async sendEmail(body, subject, emailAddresses) {
        const charset = 'UTF-8';
        const params = {
            Source: process.env.EMAIL_SENDER,
            Destination: {
                ToAddresses: emailAddresses,
                BccAddresses: [],
                CcAddresses: [],
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: charset,
                },
                Body: {
                    Html: {
                        Data: body,
                        Charset: charset,
                    },
                },
            },
        };
        const cmd = new client_ses_1.SendEmailCommand(params);
        await this.sesClient.send(cmd);
    }
}
exports.EmailSender = EmailSender;
EmailSender.sesClient = new client_ses_1.SESClient({
    region: process.env.REGION,
});
