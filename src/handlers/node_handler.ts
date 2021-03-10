import { MessageType } from "../message";
import { BaseHandler, Connection } from "./base_handler";
import { SubscriptionCallback, SubscriptionHandler } from "./subscription_handler";

export class NodeHandler extends BaseHandler {

  constructor(connection: Connection, id: string) {
    super(connection, id);
  }

  async createSubscription(messageType: string, topicName: string, callback: SubscriptionCallback): Promise<SubscriptionHandler> {
    const response = await this.request(MessageType.CREATE_SUBSCRIPTION, {
      node_id: this.id,
      message_type: messageType,
      topic_name: topicName,
    });

    const subscription = new SubscriptionHandler(this.connection, response.content.subscription_id, callback);
    this.attach(subscription);

    return subscription;
  }
}
