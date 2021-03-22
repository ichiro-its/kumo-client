import {
  w3cwebsocket as Connection,
  ICloseEvent,
  IMessageEvent,
} from "websocket";

import { SessionHandler } from "./handlers";
import { Message } from "./message";

export type ConnectCallback = (session: SessionHandler) => void;
export type DisconnectCallback = (code: number, reason: string) => void;
export type ErrorCallback = (err: Error) => void;

export class Bridge {
  #connection?: Connection;
  #session?: SessionHandler;

  #connectCallback?: ConnectCallback;
  #disconnectCallback?: DisconnectCallback;
  #errorCallback?: ErrorCallback;

  constructor() {
    return this;
  }

  onConnect(callback: ConnectCallback): Bridge {
    this.#connectCallback = callback;
    return this;
  }

  onDisconnect(callback: DisconnectCallback): Bridge {
    this.#disconnectCallback = callback;
    return this;
  }

  onError(callback: ErrorCallback): Bridge {
    this.#errorCallback = callback;
    return this;
  }

  connect(url: string): void {
    try {
      this.#connection = new Connection(url);

      this.#connection.onopen = (): void => {
        if (!this.#connection) {
          return;
        }

        const session = new SessionHandler(this.#connection);
        this.#session = session;

        if (this.#connectCallback) {
          this.#connectCallback(session);
        }
      };

      this.#connection.onclose = (ev: ICloseEvent): void => {
        if (this.#session) {
          this.#session.cleanUp();
        }

        if (this.#disconnectCallback) {
          this.#disconnectCallback(ev.code, ev.reason);
        }
      };

      this.#connection.onmessage = (ev: IMessageEvent): void => {
        const message: Message = Message.parseMessage(String(ev.data));
        this.#session?.handleMessage(message);
      };

      this.#connection.onerror = (err: Error) => {
        if (this.#errorCallback && err instanceof Error) {
          this.#errorCallback(err);
        }
      };
    } catch (err) {
      if (this.#errorCallback && err instanceof Error) {
        this.#errorCallback(err);
      } else {
        throw err;
      }
    }
  }
}
