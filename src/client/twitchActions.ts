import { inject, injectable }  from 'inversify';
import { TwitchEvents }        from './twitchEvents';
import { WebSocketHolder }     from './webSocketHolder';
import { TwitchClientOptions } from './twitchClient';
import { COMMANDS }            from './twitchConstants';

@injectable()
export class TwitchActions {
  @inject(WebSocketHolder)
  public wsHolder: WebSocketHolder;
  @inject(TwitchEvents)
  private events: TwitchEvents;
  @inject('TwitchClientOptions')
  private options: TwitchClientOptions;

  public say(message: string) {
    this.wsHolder.get().send(`${COMMANDS.PRIVATE_MESSAGE} #${this.options.channel} :${message}`);
  }

  public whisper(username: string, message: string) {
    this.wsHolder.get().send(`${COMMANDS.WHISPER} :/w ${username} ${message}`);
  }
}
