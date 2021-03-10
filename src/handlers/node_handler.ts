import { BaseHandler, Connection } from "./base_handler"

export class NodeHandler extends BaseHandler {

  id: string;

  constructor(connection: Connection, id: string) {
    super(connection);

    this.id = id;
  }
}
