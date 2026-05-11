import { UserProfile, Follow, Comment, Reaction, FeedItem } from "../types";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export class SocialDataService {
  private profiles: UserProfile[] = [
    {
      id: "profile-1",
      userId: "user-1",
      displayName: "Alex Streamer",
      bio: "Live streaming creator",
      avatarUrl: null,
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private follows: Follow[] = [];
  private comments: Comment[] = [];
  private reactions: Reaction[] = [];
  private feed: FeedItem[] = [
    {
      id: "feed-1",
      creatorName: "Alex Streamer",
      title: "Live beat production session",
      viewers: 220,
      category: "Music",
      isLive: true,
      thumbnailUrl: null,
    },
    {
      id: "feed-2",
      creatorName: "Mia Creative",
      title: "Realtime art collaboration",
      viewers: 130,
      category: "Art",
      isLive: false,
      thumbnailUrl: null,
    },
  ];

  getAllProfiles(): UserProfile[] {
    return this.profiles;
  }

  getProfileById(id: string): UserProfile | undefined {
    return this.profiles.find((profile) => profile.id === id);
  }

  createProfile(
    userId: string,
    displayName: string,
    bio?: string,
    avatarUrl?: string,
  ) {
    const profile: UserProfile = {
      id: `profile-${makeId()}`,
      userId,
      displayName,
      bio: bio ?? null,
      avatarUrl: avatarUrl ?? null,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.profiles.push(profile);
    return profile;
  }

  follow(followerId: string, followeeId: string) {
    const existing = this.follows.find(
      (item) =>
        item.followerId === followerId && item.followeeId === followeeId,
    );
    if (!existing) {
      const follow: Follow = {
        id: `follow-${makeId()}`,
        followerId,
        followeeId,
        createdAt: new Date().toISOString(),
      };
      this.follows.push(follow);
      return follow;
    }
    return existing;
  }

  unfollow(followerId: string, followeeId: string) {
    const index = this.follows.findIndex(
      (item) =>
        item.followerId === followerId && item.followeeId === followeeId,
    );
    if (index !== -1) {
      return this.follows.splice(index, 1)[0];
    }
    return null;
  }

  addComment(streamId: string, userId: string, content: string) {
    const comment: Comment = {
      id: `comment-${makeId()}`,
      streamId,
      userId,
      content,
      createdAt: new Date().toISOString(),
    };
    this.comments.push(comment);
    return comment;
  }

  getComments(streamId: string) {
    return this.comments.filter((comment) => comment.streamId === streamId);
  }

  addReaction(streamId: string, userId: string, type: string) {
    const reaction: Reaction = {
      id: `reaction-${makeId()}`,
      streamId,
      userId,
      type,
      createdAt: new Date().toISOString(),
    };
    this.reactions.push(reaction);
    return reaction;
  }

  getReactions(streamId: string) {
    return this.reactions.filter((reaction) => reaction.streamId === streamId);
  }

  getFeed() {
    return this.feed;
  }

  getTrending() {
    return this.feed.filter((item) => item.isLive).slice(0, 5);
  }

  getRecommended() {
    return this.feed.slice(0, 5);
  }
}

export const socialDataService = new SocialDataService();
