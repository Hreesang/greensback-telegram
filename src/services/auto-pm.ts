import { NewMessageEvent } from 'telegram/events';
import keywords from '@/config/auto-pm-keywords.json';
import { getDisplayName } from 'telegram/Utils';
import { Api } from 'telegram';

export const processAutoPM = async (event: NewMessageEvent) => {
  const client = event.client;
  const messageEvent = event.message;

  const sendMessage = async (message: string) => {
    try {
      const group = await messageEvent.getChat();

      if (client && group) {
        await client.getParticipants(group);

        const sender = (await messageEvent.getSender()) as Api.User;
        await client.sendMessage(sender, { message });

        let senderName: string;

        if (sender.username) {
          senderName = '@' + sender.username;
        } else if (sender.phone) {
          senderName = `${getDisplayName(sender)} (+${sender.phone})`;
        } else {
          senderName = getDisplayName(sender);
        }

        console.log(`An auto PM has been sent to ${senderName}.`);
      }
    } catch (e) {
      console.log(e);
    }
  };

  for (const [keyword, message] of Object.entries(keywords)) {
    if (messageEvent.message.match(keyword)) {
      await sendMessage(message);
    }
  }
};
