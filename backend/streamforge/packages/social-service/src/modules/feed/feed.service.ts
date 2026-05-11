import { socialDataService } from "../../services/social-data.service";

export class FeedService {
  async getFeed() {
    return socialDataService.getFeed();
  }

  async getTrending() {
    return socialDataService.getTrending();
  }

  async getRecommended() {
    return socialDataService.getRecommended();
  }
}
