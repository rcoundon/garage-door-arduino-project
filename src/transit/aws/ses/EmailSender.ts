import { SESClient, SendEmailCommandInput, SendEmailCommand } from '@aws-sdk/client-ses';

export class EmailSender {
  static sesClient = new SESClient({
    region: process.env.REGION,
  });
  public static async sendEmail(body: string, subject: string, emailAddresses: string[]): Promise<void> {
    const charset = 'UTF-8';
    const params: SendEmailCommandInput = {
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
    const cmd = new SendEmailCommand(params);
    await this.sesClient.send(cmd);
  }
}
