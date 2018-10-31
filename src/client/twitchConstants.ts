export const CAPABILITIES = [

];

export const MEMBERSHIP_COMMANDS = {
  JOIN: 'JOIN',
  MODE: 'MODE',
  PART: 'PART',
  NAMES: '353',
  NAMES_END: '366',
};

export const SERVER_COMANDS = {
  CONNECTED: '001',
  PING: 'PING',
  PONG: 'PONG',
};

export const COMMANDS = {
  ...MEMBERSHIP_COMMANDS,
  ...SERVER_COMANDS,
  PRIVATE_MESSAGE: 'PRIVMSG',
};

export const EVENTS = {
  ...COMMANDS,
};
