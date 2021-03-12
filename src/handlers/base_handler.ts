import { connection as Connection } from "websocket";
export { connection as Connection } from "websocket";
import { Message, MessageType } from "../message";

class Executor<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;

  constructor(
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ) {
    this.resolve = resolve;
    this.reject = reject;
  }
}

export class BaseHandler {
  id: string;
  connection: Connection;

  #active: boolean;

  #parent: BaseHandler | null;
  #childs: Map<string, BaseHandler>;

  #executors: Map<MessageType, Map<string, Executor<Message>>>;

  constructor(connection: Connection, id: string) {
    this.connection = connection;
    this.id = id;

    this.#active = true;

    this.#parent = null;
    this.#childs = new Map();

    this.#executors = new Map();
  }

  cleanUp(): boolean {
    if (this.#active) {
      this.#active = false;

      for (const map of this.#executors.values()) {
        for (const executor of map.values()) {
          executor.reject(new Error("Handler destroyed"));
        }
      }

      for (const child of this.#childs.values()) {
        child.cleanUp();
      }

      return true;
    } else {
      return false;
    }
  }

  attach(child: BaseHandler): void {
    child.#parent = this;
    this.#childs.set(child.id, child);

    if (!this.#active) {
      child.cleanUp();
    }
  }

  detach(id: string): void {
    if (this.#childs.has(id)) {
      const child = this.#childs.get(id);
      this.#childs.delete(id);

      if (child) {
        if (child.#active) {
          child.cleanUp();
        }

        child.#parent = null;
      }
    }
  }

  handleMessage(message: Message): void {
    const map = this.#executors.get(message.type);
    if (map) {
      const executor = map.get(message.id);
      if (executor) {
        if (message.content.error) {
          executor.reject(message.content.error);
        } else {
          executor.resolve(message);
        }
      }
    }

    for (const child of this.#childs.values()) {
      if (child.#active) {
        child.handleMessage(message);
      }
    }
  }

  send(message: Message) {
    this.connection.send(message.toString());
  }

  async request(type: MessageType, content: any): Promise<Message> {
    return new Promise<Message>((resolve, reject) => {
      try {
        const message = new Message(type, content);

        this.send(message);

        let map = this.#executors.get(message.type);
        if (!map) {
          map = new Map();
          this.#executors.set(message.type, map);
        }

        map.set(message.id, new Executor(resolve, reject));
      } catch (e) {
        reject(e);
      }
    });
  }

  async response(request: Message, content: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const message = new Message(request.type, content, request.id);

        this.send(message);

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
}
