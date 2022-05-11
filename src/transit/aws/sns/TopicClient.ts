import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

export class TopicClient {
  private static snsClient: SNSClient;

  public static async publishMessage(message: string, topicArn: string): Promise<void> {
    if (!this.snsClient) {
      this.snsClient = new SNSClient({
        region: process.env.REGION,
      });
    }
    const command = new PublishCommand({
      Message: message,
      TopicArn: topicArn,
    });
    await this.snsClient.send(command);
  }
}
