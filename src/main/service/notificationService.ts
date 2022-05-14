import { EmailSender } from '@/transit/aws/ses/EmailSender';
import { TopicClient } from '@/transit/aws/sns/TopicClient';
import { DoorState } from '@/handlers/lambda';

export const notify = async (state: DoorState) => {
  const text = state === 'open' ? `I think you might have left the door open!` : `The door is now closed`;
  const emails = process.env.EMAIL_TARGET.split(',');
  await EmailSender.sendEmail(text, state, emails);
  await TopicClient.publishMessage(text, process.env.TOPIC_ARN);
};
