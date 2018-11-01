export interface TwitchUser {
  username: string;
  displayName: string;
}

export interface TwitchMessage {
  user: TwitchUser;
  message: string;
}

export interface RawMessage {
  raw: string;
  prefix: string;
  command: string;
  tags: object;
  params: string[];
}
