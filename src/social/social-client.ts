export interface SocialClient {
  replyToComment(input: { commentId: string; text: string }): Promise<void>;
  sendDM(input: { userId: string; text: string }): Promise<void>;
}

export class LoggingSocialClient implements SocialClient {
  async replyToComment(input: { commentId: string; text: string }): Promise<void> {
    console.log("replyToComment", input);
  }

  async sendDM(input: { userId: string; text: string }): Promise<void> {
    console.log("sendDM", input);
  }
}
