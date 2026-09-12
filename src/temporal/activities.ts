import type { SocialClient } from "../social/social-client.js";

export type ReplyToCommentInput = {
  commentId: string;
  text: string;
};

export type SendDMInput = {
  userId: string;
  text: string;
};

export function createActivities(social: SocialClient) {
  return {
    replyToComment: (input: ReplyToCommentInput) => social.replyToComment(input),
    sendDM: (input: SendDMInput) => social.sendDM(input),
  };
}

export type Activities = ReturnType<typeof createActivities>;
