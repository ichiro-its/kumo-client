import { MessageType } from "../message";
import { BaseHandler, Connection } from "./base_handler";

export class ClientHandler extends BaseHandler {
  constructor(connection: Connection, id: string) {
    super(connection, id);
  }

  async destroy(): Promise<void> {
    await this.sendRequest(MessageType.DESTROY_CLIENT, {
      client_id: this.id,
    });

    this.cleanUp();
  }

  async call(request: any): Promise<any> {
    const response = await this.sendRequest(MessageType.CLIENT_REQUEST, {
      client_id: this.id,
      request: request,
    });

    return response.content["response"];
  }
}
