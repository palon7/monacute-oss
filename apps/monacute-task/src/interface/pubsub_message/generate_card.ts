import { PubSubMessage } from "./pubsub_message";

export class PubSubMessageGenerateCard extends PubSubMessage {
  command = "generate_gen0_card";

  constructor(public readonly monacuteId: number) {
    super();
  }

  getJSON = (): string =>
    JSON.stringify({
      command: this.command,
      monacute_id: this.monacuteId,
    });
}
