import { presenceJoin, presenceLeave } from "../../redis/presence-store";

export class PresenceService {
  async createPresence(payload: { streamId: string; userId: string }) {
    const approxViewers = await presenceJoin(payload.streamId, payload.userId);
    return {
      streamId: payload.streamId,
      userId: payload.userId,
      approxViewers,
      joinedAt: new Date().toISOString(),
    };
  }

  async endPresence(payload: { streamId: string; userId: string }) {
    const approxViewers = await presenceLeave(payload.streamId, payload.userId);
    return {
      streamId: payload.streamId,
      userId: payload.userId,
      approxViewers,
      leftAt: new Date().toISOString(),
    };
  }
}
