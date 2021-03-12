import { MessageType } from "../message";
import { BaseHandler, Connection } from "./base_handler";

export class PublisherHandler extends BaseHandler {
  constructor(connection: Connection, id: string) {
    super(connection, id);
  }

  async destroy(): Promise<void> {
    await this.sendRequest(MessageType.DESTROY_PUBLISHER, {
      publisher_id: this.id,
    });

    this.cleanUp();
  }

  async publish(message: any): Promise<void> {
    await this.sendRequest(MessageType.PUBLISHER_MESSAGE, {
      publisher_id: this.id,
      message: message,
    });
  }
}
