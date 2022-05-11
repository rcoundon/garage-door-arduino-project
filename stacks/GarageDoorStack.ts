import * as sst from '@serverless-stack/resources';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
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

    const basicAuthHandler = new sst.Function(this, 'basicAuthHandler', {
      handler: 'src/main/handlers/basicAuth.handleBasicAuth',
      environment: {
        BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
        BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
      },
    });

    const notifyFunction = new sst.Function(this, 'notifyFunction', {
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

    const api = new sst.Api(this, 'Api', {
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
      },
    });

    // Show the endpoint in the output
    this.addOutputs({
      ApiEndpoint: api.url,
    });
  }
}
