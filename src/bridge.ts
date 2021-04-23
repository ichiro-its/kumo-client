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
  private connection: Connection | null = null;
  private session: SessionHandler | null = null;

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
    return new Promise((resolve, reject) => {
      this.connection = new Connection(url);

      this.connection.onopen = (): void => {
        if (this.connection === null) {
          return;
        }

        this.session = new SessionHandler(this.connection);

        for (const callback of this.connectCallbacks) {
          callback(this.session);
        }

        resolve(this.session);
      };

      this.connection.onclose = (ev: ICloseEvent): void => {
        const reason = ev.reason ?? "unknown reason";
        const code = ev.code ?? -1;

        if (this.session !== null) {
          this.session.cleanUp();

          for (const callback of this.disconnectCallbacks) {
            callback(code, reason);
          }

          this.session = null;
        }

        reject(Error(`${reason} (${code})`));
      };

      this.connection.onmessage = (ev: IMessageEvent): void => {
        const message: Message = Message.parseMessage(String(ev.data));
        this.session?.handleMessage(message);
      };

      this.connection.onerror = (err: Error) => {
        const message = err.message ?? "unknown error";

        if (this.session !== null) {
          for (const callback of this.errorCallbacks) {
            callback(Error(message));
          }
        }

        reject(Error(message));
      };
    });
  }
}
