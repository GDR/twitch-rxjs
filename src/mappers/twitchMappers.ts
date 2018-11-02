import { Observable }                from 'rxjs';
import { map }                       from 'rxjs/operators';
import { RawMessage, TwitchMessage } from '../entities/twitchEntities';

export const voidMapper = (source: Observable<RawMessage>): Observable<void> => {
  return source.pipe(
    map(() => {
      return;
    }),
  );
};

export const userMapper = (source: Observable<RawMessage>): Observable<TwitchMessage> => {
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
