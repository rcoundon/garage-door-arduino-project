import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { notify } from '../service/notificationService';

export type DoorState = 'open' | 'close';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event?.queryStringParameters?.state)
    return {
      statusCode: 400,
    };

  const openOrClose = event.queryStringParameters?.state;

  if (!isDoorState(openOrClose))
    return {
      statusCode: 400,
    };

  try {
    await notify(openOrClose);
    return {
      statusCode: 204,
    };
  } catch (err) {
    return {
      statusCode: 500,
    };
  }
};

function isDoorState(state: string): state is DoorState {
  return state === 'open' || state === 'close';
}
