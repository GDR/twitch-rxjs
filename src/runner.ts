
// client.connect();

import * as dotenv from 'dotenv';
import {ChatClient, ChatClientOptions} from "./client/chatClient";

dotenv.config();

const options: ChatClientOptions = {
    identity: {
        username: process.env.username,
        password: process.env.password,
    },
    channel: process.env.channel
};

const client = new ChatClient(options);

client.connect();
