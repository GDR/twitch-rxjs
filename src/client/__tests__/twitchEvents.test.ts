import 'reflect-metadata';
import { Container }           from 'inversify';
import { twitchModule }        from '../../ioc/twitchIocModule';
import { TwitchClientOptions } from '../twitchClient';
import { TwitchEvents }        from '../twitchEvents';
import { WebSocketHolder }     from '../webSocketHolder';

const asd = jest.fn();

const wsHolder = jest.mock('../webSocketHolder', () => {
  return {
    get: jest.fn(() => {
      return {
        addListener: asd,
      };
    }),
  };
});

const options: TwitchClientOptions = {
  channel: 'channel',
  identity: {
    username: 'username',
    password: 'password',
  },
};

describe('twitchEvents tests', () => {
  let events: TwitchEvents;
  let wsHolder: WebSocketHolder;

  beforeEach(() => {
    const container = new Container();
    container.load(twitchModule(options));
    events = container.resolve(TwitchEvents);
    wsHolder = container.resolve(WebSocketHolder);
  });

  it('Test connection', () => {
    events.connect();
    console.log(asd.mock.calls);
  });
});
