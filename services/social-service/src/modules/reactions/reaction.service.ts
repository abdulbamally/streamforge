import { prisma } from "../../utils/prisma";

const MAX_TYPE_LEN = 64;

export class ReactionService {
  async addReaction(streamId: string, userId: string, type: string) {
    const t = type.trim();
    if (!t.length) {
      const err = new Error("Reaction type is required");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }
    if (t.length > MAX_TYPE_LEN) {
      const err = new Error("Reaction type is too long");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }

    const stream = await prisma.stream.findFirst({
      where: { id: streamId },
      select: { id: true },
    });
    if (!stream) {
      const err = new Error("Stream not found");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 404;
      throw err;
    }

    const row = await prisma.streamReaction.create({
      data: { streamId, userId, type: t },
    });

    return {
      id: row.id,
      streamId: row.streamId,
      userId: row.userId,
      type: row.type,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async getReactions(streamId: string) {
    const rows = await prisma.streamReaction.findMany({
      where: { streamId },
      orderBy: { createdAt: "desc" },
      take: 2000,
    });
    return rows.map((row) => ({
      id: row.id,
      streamId: row.streamId,
      userId: row.userId,
      type: row.type,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
