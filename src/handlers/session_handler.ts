import { Message, MessageType } from "../message";
import { BaseHandler, Connection } from "./base_handler";
import { NodeHandler } from "./node_handler";

export class SessionHandler extends BaseHandler {
  constructor(connection: Connection) {
    super(connection, "-1");
  }

  handleMessage(message: Message) {
    super.handleMessage(message);
  }

  async createNode(nodeName: string): Promise<NodeHandler> {
    const response = await this.sendRequest(MessageType.CREATE_NODE, {
      node_name: nodeName,
    });

    const node = new NodeHandler(this.connection, response.content["node_id"]);
    this.attach(node);

    return node;
  }
}
