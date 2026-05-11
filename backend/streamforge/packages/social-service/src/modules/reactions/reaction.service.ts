import { socialDataService } from "../../services/social-data.service";

export class ReactionService {
  async addReaction(streamId: string, userId: string, type: string) {
    return socialDataService.addReaction(streamId, userId, type);
  }

  async getReactions(streamId: string) {
    return socialDataService.getReactions(streamId);
  }
}
