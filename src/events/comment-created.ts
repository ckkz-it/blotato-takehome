import { matchesAutomation } from "../automations/matcher.js";
import type { AutomationRepository } from "../db/automation-repository.js";
import type { EventRepository } from "../db/event-repository.js";
import type { CommentCreatedEvent } from "../domain/events.js";
import type { TemporalGateway } from "../temporal/client.js";

export type CommentCreatedDependencies = {
  automations: AutomationRepository;
  events: EventRepository;
  temporal: TemporalGateway;
};

export async function handleCommentCreated(
  event: CommentCreatedEvent,
  dependencies: CommentCreatedDependencies,
): Promise<void> {
  const firstDelivery = await dependencies.events.tryMarkProcessed(event.platform, event.id);

  if (!firstDelivery) return;

  const automations = await dependencies.automations.findEnabledAutomations();
  const automation = automations.find((candidate) => matchesAutomation(candidate, event)); // in prod would be a separate matching service

  if (!automation) return; // in prod - log for observability, maybe metrics

  await dependencies.temporal.startAutomationWorkflow({
    workflowId: `automation:${automation.id}:comment:${event.commentId}`,
    input: {
      automationId: automation.id,
      automationVersion: automation.version,
      commentId: event.commentId,
      userId: event.userId,
      finalLink: automation.finalLink,
    },
  });
}
