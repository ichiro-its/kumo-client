import { connection as Connection } from "websocket";
export { connection as Connection } from "websocket";
import { Message, MessageType } from "../message"

class Executor<T> {
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void

  constructor(resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) {
    this.resolve = resolve
    this.reject = reject
  }
}

export class BaseHandler {

  connection: Connection;

  #executors: Map<MessageType, Map<string, Executor<Message>>>;

  constructor(connection: Connection) {
    this.connection = connection;

    this.#executors = new Map();
  }

  destroy(): void {
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
  }

  send(message: Message) {
    this.connection.send(message.toString());
  }

  async request(type: MessageType, content: any): Promise<Message> {
    return new Promise<Message>((resolve, reject) => {
      try {
        const message = new Message(type, content);

        this.send(message);

        let map = this.#executors.get(message.type)
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
