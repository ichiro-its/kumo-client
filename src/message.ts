export enum MessageType {
  CREATE_NODE,
  DESTROY_NODE,
  CREATE_PUBLISHER,
  DESTROY_PUBLISHER,
  PUBLISHER_MESSAGE,
  CREATE_SUBSCRIPTION,
  DESTROY_SUBSCRIPTION,
  SUBSCRIPTION_MESSAGE,
  CREATE_CLIENT,
  DESTROY_CLIENT,
  CLIENT_REQUEST,
  CREATE_SERVICE,
}

export class Message {
  static idCounter = 0;

  type: MessageType;
  content: any;
  id: string;

  constructor(type: MessageType, content: any, id?: string) {
    this.type = type;
    this.content = content;
    this.id = id ? id : String(Message.idCounter++);
  }

  static parseMessage(message: string): Message {
    const jsonMessage = JSON.parse(message);

    const typeKey = jsonMessage["type"] as keyof typeof MessageType;
    const type = MessageType[typeKey];

    const content = jsonMessage["content"];
    const id = String(jsonMessage["id"]);

    return new Message(type, content, id);
  }

  toString(): string {
    return JSON.stringify({
      type: MessageType[this.type],
      id: this.id,
      content: this.content,
    });
  }
}
