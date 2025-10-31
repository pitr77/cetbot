
export enum Sender {
  USER,
  BOT,
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
}
