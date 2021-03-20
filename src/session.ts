import {
  w3cwebsocket as Connection,
  ICloseEvent,
  IMessageEvent,
} from "websocket";

import { ContextHandler } from "./handlers";
import { Message } from "./message";

export type ConnectCallback = (context: ContextHandler) => void;
export type DisconnectCallback = (code: number, reason: string) => void;
export type ErrorCallback = (err: Error) => void;

export class Session {
  #connection?: Connection;
  #context?: ContextHandler;

  #connectCallback?: ConnectCallback;
  #disconnectCallback?: DisconnectCallback;
  #errorCallback?: ErrorCallback;

  constructor() {
    return this;
  }

  onConnect(callback: ConnectCallback): Session {
    this.#connectCallback = callback;
    return this;
  }

  onDisconnect(callback: DisconnectCallback): Session {
    this.#disconnectCallback = callback;
    return this;
  }

  onError(callback: ErrorCallback): Session {
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

        const context = new ContextHandler(this.#connection);
        this.#context = context;

        if (this.#connectCallback) {
          this.#connectCallback(context);
        }
      };

      this.#connection.onclose = (ev: ICloseEvent): void => {
        if (this.#context) {
          this.#context.cleanUp();
        }

        if (this.#disconnectCallback) {
          this.#disconnectCallback(ev.code, ev.reason);
        }
      };

      this.#connection.onmessage = (ev: IMessageEvent): void => {
        const message: Message = Message.parseMessage(String(ev.data));
        this.#context?.handleMessage(message);
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
