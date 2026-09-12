import { Client, Connection } from "@temporalio/client";
import type { AutomationWorkflowInput } from "./workflows.js";
import { automationWorkflow, messageReceivedSignal } from "./workflows.js";

export const AUTOMATION_TASK_QUEUE = "automation-executions";

export interface TemporalGateway {
  startAutomationWorkflow(input: { workflowId: string; input: AutomationWorkflowInput }): Promise<void>;
  signalAutomationWorkflow(workflowId: string, text: string): Promise<void>;
}

export async function createTemporalGateway(): Promise<TemporalGateway> {
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  });
  const client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
  });

  return {
    async startAutomationWorkflow({ workflowId, input }): Promise<void> {
      await client.workflow.start(automationWorkflow, {
        taskQueue: AUTOMATION_TASK_QUEUE,
        workflowId,
        args: [input],
      });
    },

    async signalAutomationWorkflow(workflowId: string, text: string): Promise<void> {
      await client.workflow.getHandle(workflowId).signal(messageReceivedSignal, text);
    },
  };
}
