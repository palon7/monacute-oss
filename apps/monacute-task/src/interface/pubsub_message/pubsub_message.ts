export abstract class PubSubMessage {
  abstract command: string;

  abstract getJSON(): string;
}
