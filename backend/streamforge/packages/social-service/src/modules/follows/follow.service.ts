import { socialDataService } from "../../services/social-data.service";

export class FollowService {
  async follow(followerId: string, followeeId: string) {
    return socialDataService.follow(followerId, followeeId);
  }

  async unfollow(followerId: string, followeeId: string) {
    return socialDataService.unfollow(followerId, followeeId);
  }
}
