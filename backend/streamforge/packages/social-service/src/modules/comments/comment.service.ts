import { socialDataService } from "../../services/social-data.service";

export class CommentService {
  async addComment(streamId: string, userId: string, content: string) {
    return socialDataService.addComment(streamId, userId, content);
  }

  async getComments(streamId: string) {
    return socialDataService.getComments(streamId);
  }
}
