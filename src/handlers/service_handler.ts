import { MessageType } from "../message";
import { BaseHandler, Connection } from "./base_handler";

export class ServiceHandler extends BaseHandler {
  constructor(connection: Connection, id: string) {
    super(connection, id);
  }

  async destroy(): Promise<void> {
    await this.sendRequest(MessageType.DESTROY_SERVICE, {
      service_id: this.id,
    });

    this.cleanUp();
  }
}
