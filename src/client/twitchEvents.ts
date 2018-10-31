import { inject, injectable } from 'inversify';
import { WebSocketHolder } from './webSocketHolder';
import { logger } from '../logger';
import * as WebSocket from 'ws';
import { TwitchClientOptions } from './twitchClient';
import { Observable, Subject } from 'rxjs';
import * as parser from '../parser/parser';
import { filter, map, mapTo } from 'rxjs/operators';
import { COMMANDS, EVENTS } from './twitchConstants';

interface IrcMessage {
  raw: string;
  prefix: string;
  command: string;
  tags: object;
  params: string[];
}

@injectable()
export class TwitchEvents {
  @inject(WebSocketHolder)
  private wsHolder: WebSocketHolder;
  @inject('TwitchClientOptions')
  private options: TwitchClientOptions;

  private rawMessageSubject: Subject<IrcMessage> = new Subject();

  constructor() {
    this.onConnectObservable.subscribe(() => {
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
    const message: IrcMessage = parser.msg(data);
    this.rawMessageSubject.next(message);
  }

  public rawMessageObservable(): Observable<IrcMessage> {
    return this.rawMessageSubject;
  }

  public onConnectObservable: Observable<void> = this.rawMessageSubject
    .pipe(filter((value) => {
      return value.command === EVENTS.CONNECTED;
    }))
    .pipe(mapTo(null));

  public chatObservable: Observable<{
    username: string,
    message: string,
  }> = this.rawMessageSubject
    .pipe(filter((value) => {
      return value.command === EVENTS.PRIVATE_MESSAGE;
    }))
    .pipe(map(((value) => {
      return {
        username: value.tags['display-name'],
        message: value.params[1],
      };
    })));

  public pingObservable: Observable<void> =
    this.rawMessageSubject.pipe(
      filter((value) => {
        return value.command === EVENTS.PING;
      }),
    ).pipe(
      map(() => {
        return;
      }),
    );
}
