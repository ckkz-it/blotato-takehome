import { condition, defineSignal, proxyActivities, setHandler } from "@temporalio/workflow";
import type { Activities } from "./activities.js";

export type AutomationWorkflowInput = {
  automationId: string;
  automationVersion: number;
  commentId: string;
  userId: string;
  finalLink: string;
};

export const messageReceivedSignal = defineSignal<[string]>("messageReceived");

const { replyToComment, sendDM } = proxyActivities<Activities>({
  startToCloseTimeout: "10 seconds",
  retry: { maximumAttempts: 3 },
});

export async function automationWorkflow(input: AutomationWorkflowInput): Promise<void> {
  let receivedMessage: string | undefined;

  setHandler(messageReceivedSignal, (text) => {
    receivedMessage = text;
  });

  await replyToComment({
    commentId: input.commentId,
    text: "Sent you a DM!",
  });

  await sendDM({
    userId: input.userId,
    text: "What's your email address?",
  });

  await condition(() => receivedMessage !== undefined);

  await sendDM({
    userId: input.userId,
    text: `Thanks! Here's your link: ${input.finalLink}`,
  });
}
