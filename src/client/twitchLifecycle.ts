import { inject, injectable }  from 'inversify';
import { logger }              from '../logger';
import { TwitchActions }       from './twitchActions';
import { TwitchClientOptions } from './twitchClient';
import { COMMANDS }            from './twitchConstants';
import { TwitchEvents }        from './twitchEvents';
import { WebSocketHolder }     from './webSocketHolder';

@injectable()
export class TwitchLifecycle {
  private readonly options: TwitchClientOptions;
  private readonly events: TwitchEvents;
  private readonly actions: TwitchActions;
  private readonly wsHolder: WebSocketHolder;

  constructor(
    @inject('TwitchClientOptions')
      options: TwitchClientOptions,
    @inject(TwitchEvents)
      events: TwitchEvents,
    @inject(TwitchActions)
      actions: TwitchActions,
    @inject(WebSocketHolder)
      wsHolder: WebSocketHolder,
  ) {
    this.options = options;
    this.events = events;
    this.actions = actions;
    this.wsHolder = wsHolder;
  }

  private initialize() {
    // Send authentication request on connected event
    this.events.openConnectionObservable.subscribe(() => {
      const ws = this.wsHolder.get();

      if (ws) {
        ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
        ws.send(`PASS ${this.options.identity.password}`);
        ws.send(`NICK ${this.options.identity.username}`);
        ws.send(`USER ${this.options.identity.username} 8 * :${this.options.identity.username}`);
      }
    });

    // Send join channel request on success authentication
    this.events.connectedObservable.subscribe(() => {
      logger.info(`Joining channel #${this.options.channel}`);
      this.wsHolder.get().send(`${COMMANDS.JOIN} #${this.options.channel}`);
    });

    // Send pong response on server's ping request
    this.events.pingObservable.subscribe(() => {
      const ws = this.wsHolder.get();

      if (ws) {
        ws.send(`${COMMANDS.PONG} :tmi.twitch.tv`);
      }
    });
  }

  public connect(): void {
    this.initialize();
    this.events.connect();
  }
}
