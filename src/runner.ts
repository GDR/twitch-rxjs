import 'reflect-metadata';
import * as dotenv                           from 'dotenv';
import { log }                               from 'util';
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

client.events().rawMessageSubject.subscribe((data) => {
  logger.info(data);
});

client.events().chatObservable.subscribe((value) => {
  logger.info(`${value.user.displayName}: ${value.message}`);
});

client.connect();
