"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicClient = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
class TopicClient {
    static async publishMessage(message, topicArn) {
        if (!this.snsClient) {
            this.snsClient = new client_sns_1.SNSClient({
                region: process.env.REGION,
            });
        }
        const command = new client_sns_1.PublishCommand({
            Message: message,
            TopicArn: topicArn,
        });
        await this.snsClient.send(command);
    }
}
exports.TopicClient = TopicClient;
