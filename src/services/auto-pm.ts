import { Api, TelegramClient } from 'telegram';
import { NewMessageEvent } from 'telegram/events';
import { Entity } from 'telegram/define';
import { getDisplayName } from 'telegram/Utils';
import keywords from '@/config/auto-pm-keywords.json';

class AutoPM {
  private hasKeyword = (text: string) => {
    for (const [keyword, message] of Object.entries(keywords)) {
      if (text.match(keyword)) {
        return {
          key: keyword,
          text: message,
        };
      }
    }
    return undefined;
  };

  private getSenderName = (sender: Api.User) => {
    let senderName: string;

    if (sender.username) {
      senderName = '@' + sender.username;
    } else if (sender.phone) {
      senderName = `${getDisplayName(sender)} (+${sender.phone})`;
    } else {
      senderName = getDisplayName(sender);
    }

    return senderName;
  };

  private sendMessage = async (
    client: TelegramClient,
    chat: Api.Chat,
    sender: Api.User,
    text: string
  ) => {
    try {
      await client.sendMessage(sender.id, { message: text });
    } catch (e: any) {
      try {
        await client.getParticipants(chat);
        await client.sendMessage(sender.id, { message: text });
      } catch (e: any) {
        if (e.message) {
          const senderName = this.getSenderName(sender);
          throw new Error(
            `Can't send a direct message to sender: ${senderName}.\n${e.message}`
          );
        } else {
          throw e;
        }
      }
    }
  };

  public onEvent = async (event: NewMessageEvent) => {
    const message = event.message;
    if (!message.isGroup) {
      return;
    }

    const text = message.message;
    const keyword = this.hasKeyword(text);
    if (!keyword) {
      return;
    }
    console.log('passed keyword check');

    try {
      const chat = (message.chat ? message.chat : await message.getChat()) as
        | Api.Chat
        | undefined;
      if (!chat) {
        throw new Error("Can't find the chat entity.");
      }
      console.log('passed group check');

      const sender = (
        message.sender ? message.sender : await message.getSender()
      ) as Api.User | undefined;
      if (!sender) {
        throw new Error("Can't get the message sender.");
      }
      console.log('passed sender check');

      const client = message.client;
      if (!client) {
        throw new Error("Can't get the message client.");
      }
      console.log('passed client check');

      await this.sendMessage(client, chat, sender, keyword.text);

      const senderName = this.getSenderName(sender);
      console.log(`An auto PM (${keyword.key}) has sent to ${senderName}.`);
    } catch (error: any) {
      if (error.message) {
        console.log(new Error(error.message));
      } else {
        console.log(error);
      }
    }
  };
}

export default AutoPM;
