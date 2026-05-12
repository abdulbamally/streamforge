import { prisma } from "../../utils/prisma";

export class FollowService {
  async follow(followerId: string, followeeId: string) {
    if (followerId === followeeId) {
      const err = new Error("Cannot follow yourself");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }

    const followee = await prisma.user.findFirst({
      where: { id: followeeId, isActive: true },
      select: { id: true },
    });
    if (!followee) {
      const err = new Error("Creator not found");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 404;
      throw err;
    }

    const row = await prisma.socialFollow.upsert({
      where: {
        followerId_followeeId: { followerId, followeeId },
      },
      create: { followerId, followeeId },
      update: {},
    });

    return {
      id: row.id,
      followerId: row.followerId,
      followeeId: row.followeeId,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async unfollow(followerId: string, followeeId: string) {
    try {
      const row = await prisma.socialFollow.delete({
        where: {
          followerId_followeeId: { followerId, followeeId },
        },
      });
      return {
        id: row.id,
        followerId: row.followerId,
        followeeId: row.followeeId,
        createdAt: row.createdAt.toISOString(),
      };
    } catch {
      return null;
    }
  }
}
