import { MessageType } from "../message";
import { BaseHandler, Connection } from "./base_handler"
import { NodeHandler } from "./node_handler"

export class ContextHandler extends BaseHandler {

  constructor(connection: Connection) {
    super(connection);
  }

  async createNode(nodeName: string): Promise<NodeHandler> {
    const response = await this.request(MessageType.CREATE_NODE, {
      node_name: nodeName
    });

    return new NodeHandler(this.connection, response.content.node_id);
  }
}