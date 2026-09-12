import express from "express";
import { automationRepository } from "../db/automation-repository.js";
import { eventRepository } from "../db/event-repository.js";
import type { CommentCreatedEvent } from "../domain/events.js";
import { handleCommentCreated } from "../events/comment-created.js";
import { handleMessageReceived, type CorrelatedMessageReceivedEvent } from "../events/message-received.js";
import { createTemporalGateway } from "../temporal/client.js";

const temporal = await createTemporalGateway();
const app = express();

app.use(express.json());

app.post("/events/comments", async (request, response, next) => {
  try {
    await handleCommentCreated(request.body as CommentCreatedEvent, {
      automations: automationRepository,
      events: eventRepository,
      temporal,
    });
    response.sendStatus(202);
  } catch (error) {
    next(error);
  }
});

app.post("/events/messages", async (request, response, next) => {
  try {
    await handleMessageReceived(request.body as CorrelatedMessageReceivedEvent, { events: eventRepository, temporal });
    response.sendStatus(202);
  } catch (error) {
    next(error);
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
