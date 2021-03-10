import { client as WebSocket, IMessage } from "websocket";

import { ContextHandler } from "./handlers";
import { Message } from "./message";

export class Session {
  #webSocket: WebSocket;
  #context?: ContextHandler;

  #connectCallback?: (context: ContextHandler) => void;
  #disconnectCallback?: (err: Error) => void;

  constructor() {
    this.#webSocket = new WebSocket();
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
    this.#webSocket.on("connect", (connection) => {

      const context = new ContextHandler(connection);
      this.#context = context;

      if (this.#connectCallback) {
        this.#connectCallback(context)
      }

      connection.on("close", (code: number, desc: string): void => {
        if (this.#context) {
          this.#context.cleanUp();
        }

        if (this.#disconnectCallback) {
          this.#disconnectCallback(new Error(desc))
        }
      });

      connection.on("message", (ev: IMessage): void => {
        const message: Message = Message.parseMessage(String(ev.utf8Data));
        this.#context?.handleMessage(message);
      });
    });

    this.#webSocket.on("connectFailed", (err: Error) => {
      if (this.#disconnectCallback) {
        this.#disconnectCallback((err));
      }
    });

    this.#webSocket.connect(url);
  }
}
