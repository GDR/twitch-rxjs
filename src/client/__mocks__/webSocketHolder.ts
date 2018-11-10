import { injectable } from 'inversify';

export const mockWsSend = jest.fn();
export const mockWsAddListener = jest.fn();

@injectable()
export class WebSocketHolder {
  get() {
    return {
      send: mockWsSend,
      addListener: mockWsAddListener,
    };
  }
}
