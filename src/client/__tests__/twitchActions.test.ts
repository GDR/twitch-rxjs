import 'reflect-metadata';
import { Container }           from 'inversify';
import { twitchModule }        from '../../ioc/twitchIocModule';
import { mockWsSend }          from '../__mocks__/webSocketHolder';
import { TwitchActions }       from '../twitchActions';
import { TwitchClientOptions } from '../twitchClient';
import { WebSocketHolder }     from '../webSocketHolder';

const options: TwitchClientOptions = {
  channel: 'channel',
  identity: {
    username: 'username',
    password: 'password',
  },
};

jest.mock('../webSocketHolder');
jest.mock('../twitchEvents');

describe('twitchAction tests', () => {
  let container: Container;
  let actions: TwitchActions;
  let wsHolder: WebSocketHolder;

  beforeEach(() => {
    container = new Container({ autoBindInjectable: true });
    container.load(twitchModule(options));
    actions = container.get(TwitchActions);
    wsHolder = container.get(WebSocketHolder);
    mockWsSend.mockClear();
  });

  it('Test say action', () => {
    const message = 'Some message';
    actions.say(message);
    expect(wsHolder.get().send).toBeCalledWith(`PRIVMSG #${options.channel} :${message}`);
  });

  it('Test whisper action', () => {
    const username = 'username';
    const message = 'Some message';
    actions.whisper(username, message);
    expect(wsHolder.get().send).toBeCalledWith(`PRIVMSG #jtv :/w ${username} ${message}`);
  });
});
