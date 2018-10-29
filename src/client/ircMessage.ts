import * as WebSocket from 'ws';

export abstract class IrcMessage {
    protected command: string;
    protected websocket: WebSocket;

    protected constructor(tag: string, websocket: WebSocket) {
        this.command = tag;
        this.websocket = websocket;
    }

    public abstract parse(message?: string);
}