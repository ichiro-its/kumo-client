import {
  w3cwebsocket as Connection,
  ICloseEvent,
  IMessageEvent,
} from "websocket";

import { ContextHandler } from "./handlers";
import { Message } from "./message";

export class Session {
  #connection?: Connection;
  #context?: ContextHandler;

  #connectCallback?: (context: ContextHandler) => void;
  #disconnectCallback?: (err: Error) => void;

  constructor() {
    return this;
  }

  onConnect(callback: (context: ContextHandler) => void): Session {
    this.#connectCallback = callback;
    return this;
  }

  onDisconnect(callback: (err: Error) => void): Session {
    this.#disconnectCallback = callback;
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
          this.#disconnectCallback(new Error(ev.reason));
        }
      };

      this.#connection.onmessage = (ev: IMessageEvent): void => {
        const message: Message = Message.parseMessage(String(ev.data));
        this.#context?.handleMessage(message);
      };

      this.#connection.onerror = (err: Error) => {
        if (this.#disconnectCallback) {
          this.#disconnectCallback(err);
        }
      };
    } catch (err) {
      if (this.#disconnectCallback && err instanceof Error) {
        this.#disconnectCallback(err);
      }
    }
  }
}
