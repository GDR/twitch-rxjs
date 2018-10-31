import { inject, injectable } from 'inversify';
import * as WebSocket from 'ws';

@injectable()
export class WebSocketHolder {
  @inject('TwitchClientOptions')

  private ws: WebSocket;

  public connect() {
    this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443/', 'irc');
  }

  public disconnect() {
    this.ws.close();
  }

  public get(): WebSocket {
    return this.ws;
  }
}
