import { ContainerModule }     from 'inversify';
import { TwitchActions }       from '../client/twitchActions';
import { TwitchClientOptions } from '../client/twitchClient';
import { TwitchEvents }        from '../client/twitchEvents';
import { TwitchLifecycle }     from '../client/twitchLifecycle';
import { WebSocketHolder }     from '../client/webSocketHolder';

export const twitchModule = (options: TwitchClientOptions) => new ContainerModule((bind) => {
  bind<TwitchClientOptions>('TwitchClientOptions')
    .toConstantValue(options);
  bind<WebSocketHolder>(WebSocketHolder)
    .to(WebSocketHolder).inSingletonScope();
  bind<TwitchLifecycle>(TwitchLifecycle)
    .to(TwitchLifecycle)
    .inSingletonScope();
  bind<TwitchActions>(TwitchActions)
    .to(TwitchActions)
    .inSingletonScope();
  bind<TwitchEvents>(TwitchEvents)
    .to(TwitchEvents)
    .inSingletonScope();
});
