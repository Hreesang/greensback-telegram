import * as dotenv from 'dotenv';
dotenv.config();

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { prompt } from '@/helpers/prompt';

import { NewMessage } from 'telegram/events';
import { newMessageHandler } from './events/new-message-event';

const apiId = parseInt(process.env.API_ID ?? '0', 10);
const apiHash = process.env.API_HASH ?? '';
const session = process.env.SESSION ?? '';
const phoneNumber = process.env.PHONE_NUMBER ?? '';
const password = process.env.PASSWORD ?? '';

const stringSession = new StringSession(session);
const client = new TelegramClient(stringSession, apiId, apiHash, {});

(async () => {
  try {
    console.log('Logging into Telegram App account...');
    await client.start({
      phoneNumber: async () => {
        if (!phoneNumber) {
          return await prompt('Please enter your phone number: ');
        }

        return phoneNumber;
      },
      phoneCode: async () => await prompt('Please enter your phone code: '),
      password: async () => {
        if (!password) {
          return await prompt('Please enter your password: ');
        }

        return password;
      },
      onError: (err: Error) => {
        console.log('An error occured!');
        console.log(err);
      },
    });

    console.log('You are now connected!');
    await client.getDialogs();

    const generatedSession = `${client.session.save()}`;
    if (generatedSession !== session) {
      console.log('Session: ', generatedSession);
    }

    // events initializers
    client.addEventHandler(newMessageHandler, new NewMessage());
  } catch (e) {
    console.log('Failed to log into the Telegram App account:');
    console.log(e);
  }
})();
