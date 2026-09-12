import type { EventRepository } from "../db/event-repository.js";
import type { MessageReceivedEvent } from "../domain/events.js";
import type { TemporalGateway } from "../temporal/client.js";

export type CorrelatedMessageReceivedEvent = MessageReceivedEvent & {
  workflowId: string;
};

export type MessageReceivedDependencies = {
  events: EventRepository;
  temporal: TemporalGateway;
};

export async function handleMessageReceived(
  event: CorrelatedMessageReceivedEvent,
  dependencies: MessageReceivedDependencies,
): Promise<void> {
  const firstDelivery = await dependencies.events.tryMarkProcessed(event.platform, event.id);

  if (!firstDelivery) return;

  await dependencies.temporal.signalAutomationWorkflow(event.workflowId, event.text);
}
