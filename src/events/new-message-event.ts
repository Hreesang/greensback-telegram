import { NewMessageEvent } from 'telegram/events';

// services
import AutoPM from '@/services/auto-pm';

const autoPM = new AutoPM();

export const newMessageHandler = (event: NewMessageEvent) => {
  autoPM.onEvent(event);
};
