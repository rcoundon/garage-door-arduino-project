import * as sst from '@serverless-stack/resources';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SmsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

export default class GarageDoorStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const region = scope.region;
    const account = scope.account;
    const sesIdentity = `arn:aws:ses:${region}:${account}:identity/${process.env.EMAIL_SENDER}`;

    const smsSubscription = new SmsSubscription(process.env.PHONE_SUBSCRIBER, {});

    const emailSenderIdentityPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
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
