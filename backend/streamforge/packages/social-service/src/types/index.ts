export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followeeId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  streamId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  streamId: string;
  userId: string;
  type: string;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  creatorName: string;
  title: string;
  viewers: number;
  category: string;
  isLive: boolean;
  thumbnailUrl: string | null;
}
