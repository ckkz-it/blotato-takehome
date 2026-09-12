import type { CommentCreatedCondition, ConditionalCommentCreatedAutomation } from "../domain/automation.js";
import type { CommentCreatedEvent } from "../domain/events.js";

export function matchesAutomation(
  automation: ConditionalCommentCreatedAutomation,
  comment: CommentCreatedEvent,
): boolean {
  return automation.trigger.conditions.every((condition) => matchesCondition(condition, comment));
}

function matchesCondition(condition: CommentCreatedCondition, comment: CommentCreatedEvent): boolean {
  switch (condition.field) {
    case "text":
      switch (condition.operator) {
        case "equals":
          return comment.text.trim().toLowerCase() === condition.value.trim().toLowerCase();
      }
  }
}
