import { NewMessageEvent } from 'telegram/events';
import keywords from '@/config/auto-pm-keywords.json';
import { getDisplayName } from 'telegram/Utils';
import { Api } from 'telegram';

export const processAutoPM = async (event: NewMessageEvent) => {
  const client = event.client;
  const messageEvent = event.message;

  try {
    const group = await messageEvent.getChat();

    if (client && group) {
      await client.getParticipants(group);

      const sender = (await messageEvent.getSender()) as Api.User;
      let sentPMs = 0;

      for (const [keyword, message] of Object.entries(keywords)) {
        if (messageEvent.message.match(keyword)) {
          await client.sendMessage(sender, { message });
          sentPMs++;
        }
      }

      if (sentPMs > 0) {
        let senderName: string;

        if (sender.username) {
          senderName = '@' + sender.username;
        } else if (sender.phone) {
          senderName = `${getDisplayName(sender)} (+${sender.phone})`;
        } else {
          senderName = getDisplayName(sender);
        }

        if (sentPMs === 1) {
          console.log(`An auto PM has been sent to ${senderName}.`);
        } else {
          console.log(`${sentPMs} auto PMs have been sent to ${senderName}.`);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
