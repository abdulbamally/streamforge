import { socialDataService } from "../../services/social-data.service";

export class ProfileService {
  async getAllProfiles() {
    return socialDataService.getAllProfiles();
  }

  async getProfileById(id: string) {
    return socialDataService.getProfileById(id);
  }
}
