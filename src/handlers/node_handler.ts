import { MessageType } from "../message";
import { BaseHandler, Connection } from "./base_handler";
import { ClientHandler } from "./client_handler";
import { PublisherHandler } from "./publisher_handler";
import { ServiceHandler } from "./service_handler";

import {
  SubscriptionCallback,
  SubscriptionHandler,
} from "./subscription_handler";

export class NodeHandler extends BaseHandler {
  constructor(connection: Connection, id: string) {
    super(connection, id);
  }

  async destroy(): Promise<void> {
    await this.sendRequest(MessageType.DESTROY_NODE, {
      node_id: this.id,
    });

    this.cleanUp();
  }

  async createPublisher(
    messageType: string,
    topicName: string
  ): Promise<PublisherHandler> {
    const response = await this.sendRequest(MessageType.CREATE_PUBLISHER, {
      node_id: this.id,
      message_type: messageType,
      topic_name: topicName,
    });

    const publisher = new PublisherHandler(
      this.connection,
      response.content["publisher_id"]
    );

    this.attach(publisher);

    return publisher;
  }

  async createSubscription(
    messageType: string,
    topicName: string,
    callback: SubscriptionCallback
  ): Promise<SubscriptionHandler> {
    const response = await this.sendRequest(MessageType.CREATE_SUBSCRIPTION, {
      node_id: this.id,
      message_type: messageType,
      topic_name: topicName,
    });

    const subscription = new SubscriptionHandler(
      this.connection,
      response.content["subscription_id"],
      callback
    );

    this.attach(subscription);

    return subscription;
  }

  async createClient(
    serviceType: string,
    serviceName: string
  ): Promise<ClientHandler> {
    const response = await this.sendRequest(MessageType.CREATE_CLIENT, {
      node_id: this.id,
      service_type: serviceType,
      service_name: serviceName,
    });

    const client = new ClientHandler(
      this.connection,
      response.content["client_id"]
    );

    this.attach(client);

    return client;
  }

  async createService(
    serviceType: string,
    serviceName: string
  ): Promise<ServiceHandler> {
    const response = await this.sendRequest(MessageType.CREATE_SERVICE, {
      node_id: this.id,
      service_type: serviceType,
      service_name: serviceName,
    });

    const service = new ServiceHandler(
      this.connection,
      response.content["service_id"]
    );

    this.attach(service);

    return service;
  }
}
