import { fileURLToPath } from "node:url";
import { NativeConnection, Worker } from "@temporalio/worker";
import { LoggingSocialClient } from "../social/social-client.js";
import { createActivities } from "./activities.js";
import { AUTOMATION_TASK_QUEUE } from "./client.js";

const connection = await NativeConnection.connect({
  address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
});

const worker = await Worker.create({
  connection,
  namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
  taskQueue: AUTOMATION_TASK_QUEUE,
  workflowsPath: fileURLToPath(new URL("./workflows.ts", import.meta.url)),
  activities: createActivities(new LoggingSocialClient()),
});

await worker.run();
