import { NewMessageEvent } from 'telegram/events';
import keywords from '@/config/auto-pm-keywords.json';
import { getDisplayName } from 'telegram/Utils';

export const processAutoPM = async (event: NewMessageEvent) => {
  const client = event.client;
  const messageEvent = event.message;
  const sender = await messageEvent.getSender().catch((e) => console.log(e));

  if (client && messageEvent.isGroup && sender) {
    const senderName = getDisplayName(sender);
    let sentPMs = 0;

    for (const [keyword, message] of Object.entries(keywords)) {
      if (messageEvent.message.match(keyword)) {
        try {
          await client.sendMessage(sender, { message });
          sentPMs++;
        } catch (e) {
          console.log(e);
        }
      }
    }

    if (sentPMs === 1) {
      console.log(`An auto PM has been sent to @${senderName}.`);
    } else if (sentPMs > 1) {
      console.log(`${sentPMs} auto PMs have been sent to @${senderName}.`);
    }
  }
};
