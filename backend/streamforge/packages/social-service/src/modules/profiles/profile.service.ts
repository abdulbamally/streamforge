import { prisma } from "../../utils/prisma";
import type { UserProfile } from "../../types";

function mapUserToProfile(u: {
  id: string;
  displayName: string | null;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserProfile {
  return {
    id: u.id,
    userId: u.id,
    displayName: u.displayName ?? u.username,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    verified: false,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

export class ProfileService {
  async getAllProfiles(limit = 50) {
    const take = Math.min(Math.max(limit, 1), 100);
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        displayName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users.map(mapUserToProfile);
  }

  async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    const u = await prisma.user.findFirst({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        displayName: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return u ? mapUserToProfile(u) : null;
  }
}
