import { inject, injectable }        from 'inversify';
import { RawMessage, TwitchMessage } from '../entities/twitchEntities';
import {
  chatMessageMapper,
  filterCommand,
  voidMapper,
  whisperMapper,
}                                    from '../rx/twitchRxOperators';
import { WebSocketHolder }           from './webSocketHolder';
import { logger }                    from '../logger';
import * as WebSocket                from 'ws';
import { TwitchClientOptions }       from './twitchClient';
import { Observable, Subject }       from 'rxjs';
import * as parser                   from 'irc-message';
import { EVENTS }                    from './twitchConstants';

@injectable()
export class TwitchEvents {
  @inject(WebSocketHolder)
  private readonly wsHolder: WebSocketHolder;
  @inject('TwitchClientOptions')
  private readonly options: TwitchClientOptions;

  public readonly rawMessageSubject: Subject<RawMessage> = new Subject();
  private readonly openConnectionSubject: Subject<void> = new Subject();

  public connect() {
    const ws = this.wsHolder.get();
    ws.addListener('open', this.onOpen);
    ws.addListener('message', this.onMessage);
  }

  private readonly onOpen = () => {
    logger.info('Connection established');
    this.openConnectionSubject.next();
  }

  private readonly onMessage = (data: WebSocket.Data) => {
    const messages: string[] = (data as string)
      .split('\n')
      .filter(message => message);
    messages.forEach((message) => {
      this.rawMessageSubject.next(parser.parse(message));
    });
  }

  /**
   * Raw message observable
   */
  public readonly rawMessageObservable: Observable<RawMessage> = this.rawMessageSubject
    .asObservable();

  /**
   * WebSocket open status observable
   */
  public readonly openConnectionObservable: Observable<void> = this.openConnectionSubject;

  /**
   * Connection to channel observable
   */
  public readonly connectedObservable: Observable<void> = this.rawMessageObservable
    .pipe(
      filterCommand(EVENTS.CONNECTED),
      voidMapper,
    );

  /**
   * Regular chat message observable
   */
  public readonly chatObservable: Observable<TwitchMessage> = this.rawMessageObservable
    .pipe(
      filterCommand(EVENTS.PRIVATE_MESSAGE),
      chatMessageMapper,
    );

  /**
   * Whisper message observable
   */
  public readonly whisperObservable: Observable<TwitchMessage> = this.rawMessageSubject
    .pipe(
      filterCommand(EVENTS.WHISPER),
      whisperMapper,
    );

  /**
   * Server's ping observable
   */
  public readonly pingObservable: Observable<void> = this.rawMessageObservable
    .pipe(
      filterCommand(EVENTS.PING),
      voidMapper,
    );
}
