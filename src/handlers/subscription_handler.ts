import { Message, MessageType } from "../message";
import { BaseHandler, Connection } from "./base_handler";

export type AsyncSubscriptionCallback = (message: any) => Promise<void>;
export type SubscriptionCallback = (message: any) => void;

export class SubscriptionHandler extends BaseHandler {
  callback: AsyncSubscriptionCallback | SubscriptionCallback;

  constructor(
    connection: Connection,
    id: string,
    callback: AsyncSubscriptionCallback | SubscriptionCallback
  ) {
    super(connection, id);

    this.callback = callback;
  }

  handleMessage(message: Message): void {
    super.handleMessage(message);

    if (message.type === MessageType.SUBSCRIPTION_MESSAGE) {
      if (String(message.content["subscription_id"]) === this.id) {
        const result = this.callback(message.content["message"]);
        if (result instanceof Promise) {
          result.then(() => {
            this.sendResponse(message, { subscription_id: this.id });
          });
        } else {
          this.sendResponse(message, { subscription_id: this.id });
        }
      }
    }
  }

  async destroy(): Promise<void> {
    await this.sendRequest(MessageType.DESTROY_SUBSCRIPTION, {
      subscription_id: this.id,
    });

    this.cleanUp();
  }
}
