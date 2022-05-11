"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = void 0;
const EmailSender_1 = require("../transit/aws/ses/EmailSender");
const TopicClient_1 = require("../transit/aws/sns/TopicClient");
const notify = async (state) => {
    const text = `Door state changed to ${state}`;
    await EmailSender_1.EmailSender.sendEmail(text, state, [process.env.EMAIL_TARGET]);
    await TopicClient_1.TopicClient.publishMessage(text, process.env.TOPIC_ARN);
};
exports.notify = notify;
