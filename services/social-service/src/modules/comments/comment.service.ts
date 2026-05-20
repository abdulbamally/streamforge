import { prisma } from "../../utils/prisma";

const MAX_LEN = 2000;

export class CommentService {
  async addComment(streamId: string, userId: string, content: string) {
    const trimmed = content.trim();
    if (!trimmed.length) {
      const err = new Error("Comment cannot be empty");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }
    if (trimmed.length > MAX_LEN) {
      const err = new Error(`Comment must be at most ${MAX_LEN} characters`);
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

    const row = await prisma.streamComment.create({
      data: { streamId, userId, content: trimmed },
    });

    return {
      id: row.id,
      streamId: row.streamId,
      userId: row.userId,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async getComments(streamId: string) {
    const rows = await prisma.streamComment.findMany({
      where: { streamId },
      orderBy: { createdAt: "asc" },
      take: 500,
    });
    return rows.map((row) => ({
      id: row.id,
      streamId: row.streamId,
      userId: row.userId,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
