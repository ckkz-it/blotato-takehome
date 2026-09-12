import type { Automation } from "../domain/automation.js";
import type { CommentCreatedEvent } from "../domain/events.js";

export function matchesAutomation(automation: Automation, comment: CommentCreatedEvent): boolean {
  return comment.text.trim().toLowerCase() === automation.triggerKeyword.toLowerCase();
}
