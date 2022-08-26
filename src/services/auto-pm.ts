import { Api, TelegramClient } from 'telegram';
import { NewMessageEvent } from 'telegram/events';
import { getDisplayName } from 'telegram/Utils';

import Users from '@/models/Users';
import Keywords from '@/models/Keywords';

const users = new Users();
const keywords = new Keywords();

class AutoPM {
  private hasKeyword = async (messageText: string) => {
    try {
      const keywordsData = await keywords.getAll();

      for (const { key, text } of keywordsData) {
        if (messageText.match(key)) {
          return { key, text };
        }
      }
      return undefined;
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

  private senderHasAccess = async (sender: Api.User) => {
    try {
      if (sender.username || sender.phone) {
        const identifier = sender.username ?? (sender.phone as string).slice(0);
        const user = await users.get(identifier);

        if (!user) {
          return true;
        }

        if (user.keywords_permitted === 'FALSE') {
          return false;
        }
      }
    } catch (error) {
      throw error;
    }
    return true;
  };

  public onEvent = async (event: NewMessageEvent) => {
    const message = event.message;
    if (!message.isGroup) {
      return;
    }

    try {
      const text = message.message;
      const keyword = await this.hasKeyword(text);
      if (!keyword) {
        return;
      }

      const chat = (message.chat ? message.chat : await message.getChat()) as
        | Api.Chat
        | undefined;
      if (!chat) {
        throw new Error("Can't find the chat entity.");
      }

      const sender = (
        message.sender ? message.sender : await message.getSender()
      ) as Api.User | undefined;
      if (!sender) {
        throw new Error("Can't get the message sender.");
      }

      const senderName = this.getSenderName(sender);
      const hasAccess = await this.senderHasAccess(sender);
      if (!hasAccess) {
        console.log(
          `An auto PM (${keyword.key}) couldn't be sent to ${senderName}, sender wasn't permitted.`
        );
        return;
      }

      const client = message.client;
      if (!client) {
        throw new Error("Can't get the message client.");
      }

      await this.sendMessage(client, chat, sender, keyword.text);
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
