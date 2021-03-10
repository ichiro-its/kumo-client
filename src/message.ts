export enum MessageType {
  CREATE_NODE,
  CREATE_SUBSCRIPTION,
  DESTROY_SUBSCRIPTION,
  SUBSCRIPTION_MESSAGE
}

export class Message {

  static idCounter: number = 0;

  type: MessageType;
  content: any
  id: string;

  constructor(type: MessageType, content: any, id?: string) {
    this.type = type;
    this.content = content;
    this.id = (id) ? id : String(Message.idCounter++);
  }

  static parseMessage(message: string): Message {
    const jsonMessage = JSON.parse(message);

    const typeKey = jsonMessage['type'] as keyof typeof MessageType;
    const type = MessageType[typeKey];

    const content = jsonMessage['content'];
    const id = String(jsonMessage['id']);

    return new Message(type, content, id);
  }

  toString(): string {
    return JSON.stringify({
      type: MessageType[this.type],
      id: this.id,
      content: this.content
    });
  }
}
