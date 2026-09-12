export type CommentCreatedEvent = {
  id: string;
  platform: "instagram";
  postId: string;
  commentId: string;
  userId: string;
  text: string;
};

export type MessageReceivedEvent = {
  id: string;
  platform: "instagram";
  userId: string;
  text: string;
};
