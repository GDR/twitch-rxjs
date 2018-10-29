import * as WebSocket from "ws";
import { Subject } from 'rxjs';
import * as parser from "../parser/parser.js";
import {logger} from "../logger";
import * as _ from 'lodash';

export interface ChatClientConnectionOptions {
    secure?: boolean;
    server?: string;
    port?: number;
}

export interface ChatClientOptions {
    channel: string;
    identity: {
        username: string;
        password: string;
    };
    connection?: ChatClientConnectionOptions;
}

const defaultConnectionOptions: ChatClientConnectionOptions = {
    secure: true,
    server: 'irc-ws.chat.twitch.tv',
    port: 443,
};

export class ChatClient {
    private options: ChatClientOptions;
    private websocket: WebSocket;

    private messageSubject: Subject<void>;

    constructor(options: ChatClientOptions) {
        this.options = options;
        this.options.connection = _.merge({}, defaultConnectionOptions, this.options.connection);
    }

    async connect() {
        const protocol = this.options.connection.secure ? 'wss' : 'ws';

        this.websocket = new WebSocket(
            `${protocol}://${this.options.connection.server}:${this.options.connection.port}/`,
            'irc');

        this.websocket.addEventListener("open", this.onOpen);
        this.websocket.addEventListener("error", event => {
            logger.error(event);
        });
        this.websocket.addListener('message', this.onMessage);

        logger.info('Created');
    }

    disconnect() {
        this.websocket.close();
    }

    private onOpen = (event: { target: WebSocket }): void => {
        if (!this.websocket) {
            return;
        }
        logger.info('Connecting to server');
        this.websocket.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
        this.websocket.send(`PASS ${this.options.identity.password}`);
        this.websocket.send(`NICK ${this.options.identity.username}`);
        this.websocket.send(`USER ${this.options.identity.username} 8 * :${this.options.identity.username}`);
    };

    private handleMessage(message: string) {
        const msg = parser.msg(message);
        logger.info(msg.raw);

        switch (msg.command) {
            case '372':
                logger.info(this.options);
                this.websocket.send(`JOIN #${this.options.channel}`);
                return;
        }
    }

    private onMessage = (event: string): void => {
        event.split('\n')
            .filter(data => data)
            .forEach(data => {
                this.handleMessage(data);
            })
    };

    public say(msg: string) {
        this.websocket.send(`PRIVMSG #${this.options.channel} :${msg}!`);
    }
}