import { prisma } from "../../utils/prisma";
import type { FeedItem } from "../../types";

function inferCategory(title: string, description: string | null): string {
  if (description) {
    try {
      const j = JSON.parse(description) as { category?: string };
      if (j.category && typeof j.category === "string") return j.category;
    } catch {
      /* ignore */
    }
  }
  const t = title.toLowerCase();
  if (/\b(music|dj|beat)\b/.test(t)) return "Music";
  if (/\b(art|draw|paint)\b/.test(t)) return "Art";
  if (/\b(game|gaming)\b/.test(t)) return "Gaming";
  return "General";
}

function mapStreamToFeedItem(s: {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  viewerCount: number;
  status: string;
  user: { displayName: string | null; username: string };
}): FeedItem {
  return {
    id: s.id,
    creatorName: s.user.displayName ?? s.user.username,
    title: s.title,
    viewers: s.viewerCount,
    category: inferCategory(s.title, s.description),
    isLive: s.status === "LIVE",
    thumbnailUrl: s.thumbnailUrl,
  };
}

export class FeedService {
  async getFeed() {
    const streams = await prisma.stream.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 50,
      include: {
        user: { select: { displayName: true, username: true } },
      },
    });
    return streams.map(mapStreamToFeedItem);
  }

  async getTrending() {
    const streams = await prisma.stream.findMany({
      where: { status: "LIVE" },
      orderBy: [{ viewerCount: "desc" }, { updatedAt: "desc" }],
      take: 20,
      include: {
        user: { select: { displayName: true, username: true } },
      },
    });
    return streams.map(mapStreamToFeedItem);
  }

  async getRecommended(viewerUserId?: string) {
    if (!viewerUserId) {
      return this.getTrending();
    }

    const following = await prisma.socialFollow.findMany({
      where: { followerId: viewerUserId },
      select: { followeeId: true },
    });
    const followeeIds = following.map((f: { followeeId: string }) => f.followeeId);
    if (followeeIds.length === 0) {
      return this.getTrending();
    }

    const streams = await prisma.stream.findMany({
      where: {
        userId: { in: followeeIds },
        status: { in: ["LIVE", "ENDED"] },
      },
      orderBy: [{ viewerCount: "desc" }, { updatedAt: "desc" }],
      take: 30,
      include: {
        user: { select: { displayName: true, username: true } },
      },
    });

    return streams.map(mapStreamToFeedItem);
  }
}
