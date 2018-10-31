export interface TwitchUser {
  username: string;
  displayName: string;
}

export interface TwitchMessage {
  user: TwitchUser;
  message: string;
}
