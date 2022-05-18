import * as sst from '@serverless-stack/resources';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SmsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

export function GarageDoorStack(ctx: sst.StackContext) {
  const region = ctx.stack.region;
  const account = ctx.stack.account;
  const sesIdentity = `arn:aws:ses:${region}:${account}:identity/${process.env.EMAIL_SENDER}`;

  const targetPhoneSubscribers = process.env.PHONE_SUBSCRIBERS.split(',');
  const subs = targetPhoneSubscribers.map((sub) => {
    return new SmsSubscription(sub, {});
  });

  const emailSenderIdentityPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['ses:SendEmail'],
    resources: [sesIdentity],
  });

  const garageDoorTopic = new sst.Topic(ctx.stack, 'garage-door-topic', {
    cdk: {
      topic: {
        contentBasedDeduplication: false,
      },
    },
  });

  subs.forEach((sub) => {
    garageDoorTopic.cdk.topic.addSubscription(sub);
  });

  const basicAuthHandler = new sst.Function(ctx.stack, 'basicAuthHandler', {
    handler: 'src/main/handlers/basicAuth.handleBasicAuth',
    environment: {
      BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
      BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
    },
  });

  const notifyFunction = new sst.Function(ctx.stack, 'notifyFunction', {
    handler: 'src/main/handlers/lambda.handler',
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

  const testFunc = new sst.Function(ctx.stack, 'testFunc', {
    handler: 'src/main/handlers/test.handler',
  });

  const api = new sst.Api(ctx.stack, 'Api', {
    authorizers: {
      basicAuth: {
        function: basicAuthHandler,
        type: 'lambda',
      },
    },
    defaults: {
      authorizer: 'basicAuth',
    },
    routes: {
      'GET /garage': notifyFunction,
      'GET /test': testFunc,
    },
  });

  // Show the endpoint in the output
  ctx.stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
