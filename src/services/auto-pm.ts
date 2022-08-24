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

  private getSender = async (
    message: Api.Message,
    chat: Entity,
    forceGetParticipants?: boolean
  ) => {
    if (forceGetParticipants == undefined) {
      forceGetParticipants = false;
    }

    try {
      let sender = (
        message.sender ? message.sender : await message.getSender()
      ) as Api.User;
      if (!sender || forceGetParticipants) {
        const client = message.client;
        await client?.getParticipants(chat);

        sender = (
          message.sender ? message.sender : await message.getSender()
        ) as Api.User;
      }
      return sender;
    } catch (e) {
      throw e;
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
    message: Api.Message,
    client: TelegramClient,
    chat: Entity,
    sender: Api.User,
    text: string
  ) => {
    try {
      await client.sendMessage(sender, { message: text });
    } catch {
      try {
        console.log('error! caching from getParticipants...');
        sender = (await this.getSender(message, chat, true)) as Api.User;
        await client.sendMessage(sender, { message: text });
      } catch {
        try {
          console.log('error! caching from getDialogs...');
          await client.getDialogs();

          sender = (await message.getSender()) as Api.User;
          await client.sendMessage(sender, { message: text });
        } catch (e: any) {
          const senderName = this.getSenderName(sender);
          let errMessage = e.message ? (e.message as string) : '';

          throw new Error(
            `Can't send a direct message to sender: ${senderName}.\n${errMessage}`
          );
        }
      }
    }
    return sender;
  };

  public onEvent = async (event: NewMessageEvent) => {
    const message = event.message;
    const text = message.message;

    const keyword = this.hasKeyword(text);
    if (!keyword) {
      return;
    }
    console.log('passed keyword check');

    try {
      const chat = message.chat ? message.chat : await message.getChat();
      if (!chat) {
        if (message.isGroup) {
          throw new Error("Can't find the group message chat.");
        }

        return;
      }
      console.log('passed group check');

      let sender = await this.getSender(message, chat);
      if (!sender) {
        throw new Error("Can't get the message sender.");
      }
      console.log('passed sender check');

      const client = message.client;
      if (!client) {
        throw new Error("Can't get the message client.");
      }
      console.log('passed client check');

      sender = await this.sendMessage(
        message,
        client,
        chat,
        sender,
        keyword.text
      );

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
