import { fileURLToPath } from "node:url";
import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";
import { afterEach, describe, expect, it } from "vitest";
import type { Activities } from "../src/temporal/activities.js";
import { automationWorkflow, messageReceivedSignal } from "../src/temporal/workflows.js";

const calls: [string, object][] = [];
let environment: TestWorkflowEnvironment | undefined;

afterEach(async () => {
  calls.length = 0;
  await environment?.teardown();
  environment = undefined;
});

describe("automationWorkflow", () => {
  it("replies, waits for a message, then sends the link", async () => {
    environment = await TestWorkflowEnvironment.createTimeSkipping();

    const activities: Activities = {
      async replyToComment(input) {
        calls.push(["reply", input]);
      },
      async sendDM(input) {
        calls.push(["dm", input]);
      },
    };

    const worker = await Worker.create({
      connection: environment.nativeConnection,
      taskQueue: "automation-workflow-test",
      workflowsPath: fileURLToPath(new URL("../src/temporal/workflows.ts", import.meta.url)),
      activities,
    });

    await worker.runUntil(async () => {
      const handle = await environment!.client.workflow.start(automationWorkflow, {
        taskQueue: "automation-workflow-test",
        workflowId: "automation:auto-1:comment:comment-1",
        args: [
          {
            automationId: "auto-1",
            automationVersion: 1,
            commentId: "comment-1",
            userId: "user-1",
            finalLink: "https://example.com",
          },
        ],
      });

      await expect.poll(() => calls.length).toBe(2);
      expect(calls).toEqual([
        ["reply", { commentId: "comment-1", text: "Sent you a DM!" }],
        ["dm", { userId: "user-1", text: "What's your email address?" }],
      ]);

      await handle.signal(messageReceivedSignal, "person@example.com");
      await handle.result();
    });

    expect(calls).toEqual([
      ["reply", { commentId: "comment-1", text: "Sent you a DM!" }],
      ["dm", { userId: "user-1", text: "What's your email address?" }],
      [
        "dm",
        {
          userId: "user-1",
          text: "Thanks! Here's your link: https://example.com",
        },
      ],
    ]);
  }, 30_000);
});
