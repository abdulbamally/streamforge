export class SocialService {
  getStatus() {
    return {
      service: "social-service",
      features: ["profiles", "follows", "comments", "reactions"],
    };
  }
}
