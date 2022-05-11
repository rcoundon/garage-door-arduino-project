"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sst = __importStar(require("@serverless-stack/resources"));
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_sns_subscriptions_1 = require("aws-cdk-lib/aws-sns-subscriptions");
class GarageDoorStack extends sst.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const region = scope.region;
        const account = scope.account;
        const sesIdentity = `arn:aws:ses:${region}:${account}:identity/${process.env.EMAIL_SENDER}`;
        const smsSubscription = new aws_sns_subscriptions_1.SmsSubscription(process.env.PHONE_SUBSCRIBER, {});
        const emailSenderIdentityPolicy = new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ['ses:SendEmail'],
            resources: [sesIdentity],
        });
        const garageDoorTopic = new sst.Topic(this, 'garage-door-topic', {});
        garageDoorTopic.cdk.topic.addSubscription(smsSubscription);
        const notifyFunction = new sst.Function(this, 'notifyFunction', {
            handler: 'src/handlers/lambda.handler',
            environment: {
                EMAIL_SENDER: process.env.EMAIL_SENDER,
                EMAIL_TARGET: process.env.EMAIL_TARGET,
                REGION: region,
                TOPIC_NAME: garageDoorTopic.topicName,
                TOPIC_ARN: garageDoorTopic.topicArn,
            },
            permissions: [garageDoorTopic],
        });
        notifyFunction.addToRolePolicy(emailSenderIdentityPolicy);
        // Create a HTTP API
        const api = new sst.Api(this, 'Api', {
            routes: {
                'GET /': notifyFunction,
            },
        });
        // Show the endpoint in the output
        this.addOutputs({
            ApiEndpoint: api.url,
        });
    }
}
exports.default = GarageDoorStack;
