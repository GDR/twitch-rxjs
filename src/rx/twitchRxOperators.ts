import { Observable } from 'rxjs';
import { filter }     from 'rxjs/operators';
import { RawMessage } from '../entities/twitchEntities';

export const filterCommand = <T extends RawMessage>(command: string) => (source: Observable<T>) => {
  return source
    .pipe(
      filter((rawMessage: RawMessage) => {
        return rawMessage.command === command;
      }),
    );
};
