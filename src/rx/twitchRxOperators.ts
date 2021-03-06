import { Observable }                from 'rxjs';
import { filter, map }               from 'rxjs/operators';
import { RawMessage, TwitchMessage } from '../entities/twitchEntities';

export const filterCommand = <T extends RawMessage>(command: string) => (source: Observable<T>) => {
  return source
    .pipe(
      filter((rawMessage: RawMessage) => {
        return rawMessage.command === command;
      }),
    );
};

export const voidMapper = (source: Observable<RawMessage>): Observable<void> => {
  return source.pipe(
    map(() => {
      return;
    }),
  );
};

export const chatMessageMapper = (source: Observable<RawMessage>): Observable<TwitchMessage> => {
  return source.pipe(
    map((value: RawMessage): TwitchMessage => {
      return {
        user: {
          displayName: value.tags['display-name'],
          username: value.tags['display-name'],
        },
        message: value.params[1],
      };
    }),
  );
};

export const whisperMapper = (source: Observable<RawMessage>): Observable<TwitchMessage> => {
  return source.pipe(
    map((value: RawMessage): TwitchMessage => {
      return {
        user: {
          displayName: value.tags['display-name'],
          username: value.tags['display-name'],
        },
        message: value.params[1],
      };
    }),
  );
};
