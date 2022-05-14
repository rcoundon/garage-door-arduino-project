declare namespace NodeJS {
  type StringNumber = `${number}`;
  type StringBoolean = 'true' | 'false';

  export interface ProcessEnv {
    REGION: string;
    EMAIL_SENDER: string;
    EMAIL_TARGET: string;
    PHONE_SUBSCRIBERS: string;
    TOPIC_NAME: string;
    TOPIC_ARN: string;
    BASIC_AUTH_USERNAME: string;
    BASIC_AUTH_PASSWORD: string;
  }
}
