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
  private connection?: Connection;
  private session?: SessionHandler;

  private connectCallbacks: ConnectCallback[] = [];
  private disconnectCallbacks: DisconnectCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];

  constructor() {
    return this;
  }

  onConnect(callback: ConnectCallback): Bridge {
    this.connectCallbacks.push(callback);
    return this;
  }

  onDisconnect(callback: DisconnectCallback): Bridge {
    this.disconnectCallbacks.push(callback);
    return this;
  }

  onError(callback: ErrorCallback): Bridge {
    this.errorCallbacks.push(callback);
    return this;
  }

  connect(url: string): Promise<SessionHandler> {
    return new Promise((resolve) => {
      this.connection = new Connection(url);

      this.connection.onopen = (): void => {
        if (!this.connection) {
          return;
        }

        this.session = new SessionHandler(this.connection);

        for (const callback of this.connectCallbacks) {
          callback(this.session);
        }

        resolve(this.session);
      };

      this.connection.onclose = (ev: ICloseEvent): void => {
        if (this.session) {
          this.session.cleanUp();
        }

        for (const callback of this.disconnectCallbacks) {
          callback(ev.code, ev.reason);
        }
      };

      this.connection.onmessage = (ev: IMessageEvent): void => {
        const message: Message = Message.parseMessage(String(ev.data));
        this.session?.handleMessage(message);
      };

      this.connection.onerror = (err: Error) => {
        for (const callback of this.errorCallbacks) {
          callback(err);
        }
      };
    });
  }
}
