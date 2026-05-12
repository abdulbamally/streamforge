import { socialApi } from "@streamforge/api-contract";

export const socialService = {
  fetchFeed: () => socialApi.getFeed(),
};
