import 'reflect-metadata';
import * as dotenv                           from 'dotenv';
import { TwitchClient, TwitchClientOptions } from './client/twitchClient';
import { logger }                            from './logger';

dotenv.config();

const options: TwitchClientOptions = {
  channel: process.env.channel,
  identity: {
    username: process.env.username,
    password: process.env.password,
  },
};

const client = TwitchClient.create(options);

client.events().chatObservable.subscribe((value) => {
  logger.info(`${value.user.username}: ${value.message}`);
});

client.events().onConnectObservable.subscribe(() => {
  logger.info('connected');
  client.actions().say('Bot has been started');
});

client.connect();
