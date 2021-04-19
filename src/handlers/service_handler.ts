import { Message, MessageType } from "../message";
import { BaseHandler, Connection } from "./base_handler";

export type AsyncServiceCallback = (request: any) => Promise<any>;
export type ServiceCallback = (request: any) => any;

export class ServiceHandler extends BaseHandler {
  private callback: AsyncServiceCallback | ServiceCallback;

  constructor(
    connection: Connection,
    id: string,
    callback: AsyncServiceCallback | ServiceCallback
  ) {
    super(connection, id);

    this.callback = callback;
  }

  handleMessage(message: Message): void {
    super.handleMessage(message);

    if (message.type === MessageType.SERVICE_RESPONSE) {
      if (String(message.content["service_id"]) === this.id) {
        const result = this.callback(message.content["request"]);
        if (result instanceof Promise) {
          result.then((response) => {
            this.sendResponse(message, {
              service_id: this.id,
              response: response,
            });
          });
        } else {
          this.sendResponse(message, {
            service_id: this.id,
            response: result,
          });
        }
      }
    }
  }

  async destroy(): Promise<void> {
    await this.sendRequest(MessageType.DESTROY_SERVICE, {
      service_id: this.id,
    });

    this.cleanUp();
  }
}
