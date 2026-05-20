import { prisma } from "../../utils/prisma";

export class ChatService {
  async createMessage(payload: { roomId: string; userId: string; message: string }) {
    const body = payload.message.trim();
    if (!body.length) {
      const err = new Error("Message cannot be empty");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }
    if (body.length > 4000) {
      const err = new Error("Message too long");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }

    const stream = await prisma.stream.findFirst({
      where: { id: payload.roomId },
      select: { id: true },
    });
    if (!stream) {
      const err = new Error("Stream not found");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 404;
      throw err;
    }

    const row = await prisma.liveChatMessage.create({
      data: {
        streamId: payload.roomId,
        userId: payload.userId,
        body,
      },
    });

    return {
      id: row.id,
      roomId: row.streamId,
      userId: row.userId,
      message: row.body,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async getRoomMessages(roomId: string) {
    const rows = await prisma.liveChatMessage.findMany({
      where: { streamId: roomId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return rows
      .map((row) => ({
        id: row.id,
        roomId: row.streamId,
        userId: row.userId,
        message: row.body,
        createdAt: row.createdAt.toISOString(),
      }))
      .reverse();
  }
}
