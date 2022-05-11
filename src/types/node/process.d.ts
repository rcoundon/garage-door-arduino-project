declare namespace NodeJS {
  type StringNumber = `${number}`;
  type StringBoolean = 'true' | 'false';

  export interface ProcessEnv {
    REGION: string;
    EMAIL_SENDER: string;
    EMAIL_TARGET: string;
    PHONE_SUBSCRIBER: string;
    TOPIC_NAME: string;
    TOPIC_ARN: string;
  }
}