import { NewMessageEvent } from 'telegram/events';
import { processAutoPM } from '@/services/auto-pm';

export const newMessageHandler = (event: NewMessageEvent) => {
  processAutoPM(event);
};
