import { BaseHandler, Connection } from "./base_handler";

export class ServiceHandler extends BaseHandler {
  constructor(connection: Connection, id: string) {
    super(connection, id);
  }
}
