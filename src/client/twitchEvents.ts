import { inject, injectable }        from 'inversify';
import { RawMessage, TwitchMessage } from '../entities/twitchEntities';
import { userMapper, voidMapper }    from '../mappers/twitchMappers';
import { filterCommand }             from '../rx/twitchRxOperators';
import { WebSocketHolder }           from './webSocketHolder';
import { logger }                    from '../logger';
import * as WebSocket                from 'ws';
import { TwitchClientOptions }       from './twitchClient';
import { Observable, Subject }       from 'rxjs';
import * as parser                   from 'irc-message';
import { COMMANDS, EVENTS }          from './twitchConstants';

@injectable()
export class TwitchEvents {
  @inject(WebSocketHolder)
  private wsHolder: WebSocketHolder;
  @inject('TwitchClientOptions')
  private options: TwitchClientOptions;

  private rawMessageSubject: Subject<RawMessage> = new Subject();

  constructor() {
    this.connectedObservable.subscribe(() => {
      logger.info(`Joining channel #${this.options.channel}`);
      this.wsHolder.get().send(`${COMMANDS.JOIN} #${this.options.channel}`);
    });

    this.pingObservable.subscribe(() => {
      this.wsHolder.get().send(`${COMMANDS.PONG} :tmi.twitch.tv`);
    });
  }

  public connect() {
    this.wsHolder.get().addListener('open', this.onOpen);
    this.wsHolder.get().addListener('message', this.onMessage);
  }

  private readonly onOpen = () => {
    logger.info('Connection established');
    this.wsHolder.get()
      .send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
    this.wsHolder.get()
      .send(`PASS ${this.options.identity.password}`);
    this.wsHolder.get()
      .send(`NICK ${this.options.identity.username}`);
    this.wsHolder.get()
      .send(`USER ${this.options.identity.username} 8 * :${this.options.identity.username}`);
  }

  private readonly onMessage = (data: WebSocket.Data) => {
    const messages: string[] = (data as string)
      .split('\n')
      .filter(message => message);
    messages.forEach((message) => {
      this.handleMessage(message);
    });
  }

  private handleMessage(data: string) {
    const message: RawMessage = parser.parse(data);
    this.rawMessageSubject.next(message);
  }

  public rawMessageObservable(): Observable<RawMessage> {
    return this.rawMessageSubject;
  }

  public connectedObservable: Observable<void> = this.rawMessageObservable()
    .pipe(
      filterCommand(EVENTS.CONNECTED),
      voidMapper,
    );

  public chatObservable: Observable<TwitchMessage> = this.rawMessageObservable()
    .pipe(
      filterCommand(EVENTS.PRIVATE_MESSAGE),
      userMapper,
    );

  public pingObservable: Observable<void> = this.rawMessageObservable()
    .pipe(
      filterCommand(EVENTS.PING),
      voidMapper,
    );
}
