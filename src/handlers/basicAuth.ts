import 'source-map-support/register';

import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
  APIGatewayTokenAuthorizerHandler,
  AuthResponse,
  PolicyDocument,
} from 'aws-lambda';

const basicAuthUsername = process.env.BASIC_AUTH_USERNAME;
const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

function generatePolicy(principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult {
  const authResponse = {} as AuthResponse;
  authResponse.principalId = principalId;
  if (effect && resource) {
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    } as PolicyDocument;
  }
  return authResponse;
}

export const handleBasicAuth: APIGatewayTokenAuthorizerHandler = (
  event: APIGatewayTokenAuthorizerEvent,
): Promise<AuthResponse> => {
  if (!event?.authorizationToken) {
    return Promise.resolve(generatePolicy('user', 'Deny', event.methodArn));
  }
  const authToken = event.authorizationToken;
  if (!authToken) {
    return Promise.resolve(generatePolicy('user', 'Deny', event.methodArn));
  }

  const encodedCreds = authToken.split(' ')[1];
  const buf = Buffer.from(encodedCreds, 'base64');

  const plainCreds = buf.toString().split(':');

  const username = plainCreds[0];
  try {
    if (basicAuthUsername !== username) {
      return Promise.resolve(generatePolicy('user', 'Deny', event.methodArn));
    }
    const password = plainCreds[1];
    if (basicAuthPassword !== password) {
      return Promise.resolve(generatePolicy('user', 'Deny', event.methodArn));
    }

    const authResponse = generatePolicy(username, 'Allow', event.methodArn);
    return Promise.resolve(authResponse);
  } catch (err) {
    return Promise.resolve(generatePolicy('user', 'Deny', event.methodArn));
  }
};
