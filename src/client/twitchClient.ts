import 'reflect-metadata';
import { Container, inject, injectable } from 'inversify';
import { TwitchActions }                             from './twitchActions';
import { TwitchEvents }                              from './twitchEvents';
import { logger }                                    from '../logger';
import { WebSocketHolder }                           from './webSocketHolder';

export interface TwitchClientConnectionOptions {
  secure?: boolean;
  server?: string;
  port?: number;
}

export interface TwitchClientOptions {
  channel: string;
  identity: {
    username: string;
    password: string;
  };
  connection?: TwitchClientConnectionOptions;
}

@injectable()
export class TwitchClient {
  @inject(TwitchActions)
  private readonly twitchActions: TwitchActions;
  @inject(TwitchEvents)
  private readonly twitchEvents: TwitchEvents;
  @inject('TwitchClientOptions')
  private readonly options: TwitchClientOptions;
  @inject(WebSocketHolder)
  private readonly wsHolder: WebSocketHolder;

  static create(options: TwitchClientOptions): TwitchClient {
    const container = new Container({ autoBindInjectable: true });

    container
      .bind<TwitchClientOptions>('TwitchClientOptions')
      .toConstantValue(options);
    container
      .bind<WebSocketHolder>(WebSocketHolder)
      .to(WebSocketHolder).inSingletonScope();

    return container.get(TwitchClient);
  }

  public connect() {
    logger.info('Connecting');
    this.wsHolder.connect();
    this.twitchEvents.connect();
  }

  public disconnect() {
    logger.info('Disconnecting');
    this.wsHolder.disconnect();
  }

  public events(): TwitchEvents {
    return this.twitchEvents;
  }

  public actions(): TwitchActions {
    return this.twitchActions;
  }
}
