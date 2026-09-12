import { condition, defineSignal, proxyActivities, setHandler } from "@temporalio/workflow";
import type { AutomationStep } from "../domain/automation.js";
import type { Activities } from "./activities.js";

export type AutomationWorkflowInput = {
  automationId: string;
  automationVersion: number;
  commentId: string;
  userId: string;
  steps: AutomationStep[];
};

export const messageReceivedSignal = defineSignal<[string]>("messageReceived");

// external side effects (social api) run as Activities so Temporal can retry failures
// in prod integrations must still make outbound effects idempotent because
// Activity execution is at-least-once
const { replyToComment, sendDM } = proxyActivities<Activities>({
  startToCloseTimeout: "10 seconds",
  retry: { maximumAttempts: 3 },
});

export async function automationWorkflow(input: AutomationWorkflowInput): Promise<void> {
  const receivedMessages: string[] = [];

  setHandler(messageReceivedSignal, (text) => {
    receivedMessages.push(text);
  });

  // use simple steps instead of grapgh - should be good enough for this case and can be extended later
  for (const step of input.steps) {
    switch (step.type) {
      case "reply_to_comment":
        await replyToComment({
          commentId: input.commentId,
          text: step.text,
        });
        break;

      case "send_dm":
        await sendDM({
          userId: input.userId,
          text: step.text,
        });
        break;

      case "wait_for_message": {
        // Temporal persists workflow state in a durable way and resumes execution when the signal arrives
        await condition(() => receivedMessages.some((message) => isValidMessage(step.validator, message)));
        const messageIndex = receivedMessages.findIndex((message) => isValidMessage(step.validator, message));
        receivedMessages.splice(messageIndex, 1);
        break;
      }
    }
  }
}

function isValidMessage(validator: "email", _message: string): boolean {
  switch (validator) {
    case "email":
      // Validation remains deliberately trivial for this prototype.
      return true;
  }
}
