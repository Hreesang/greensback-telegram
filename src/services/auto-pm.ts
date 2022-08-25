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

  private getSender = async (message: Api.Message, chat: Entity) => {
    try {
      let sender = (
        message.sender ? message.sender : await message.getSender()
      ) as Api.User;

      if (!sender.username && !sender.phone) {
        console.log("sender doesn't have username and phone. getting it...");

        const client = message.client as TelegramClient;
        await client.getDialogs();

        const participants = await client.getParticipants(chat);
        for (const participant of participants) {
          if (participant.id === sender.id) {
            sender = participant;
            break;
          }
        }

        console.log(
          `done! username is ${sender.username}, and phone number is ${sender.phone}.`
        );
      }

      return sender;
    } catch (e) {
      throw e;
    }
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
    sender: Api.User,
    text: string
  ) => {
    try {
      const inputSender = await client.getInputEntity(
        sender.username ?? sender.id
      );
      await client.sendMessage(inputSender, { message: text });
    } catch (e: any) {
      const senderName = this.getSenderName(sender);
      const errMessage = e.any ?? '';

      throw new Error(
        `Can't send a direct message to sender: ${senderName}.\n${errMessage}`
      );
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

      sender = await this.sendMessage(client, sender, keyword.text);

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
