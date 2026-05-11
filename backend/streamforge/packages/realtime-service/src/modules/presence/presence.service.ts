export class PresenceService {
  async createPresence(payload: { userId: string; streamId: string }) {
    return {
      id: "presence-session-id",
      userId: payload.userId,
      streamId: payload.streamId,
      isActive: true,
      connectedAt: new Date().toISOString(),
    };
  }

  async endPresence(payload: { userId: string; streamId: string }) {
    return {
      id: "presence-session-id",
      userId: payload.userId,
      streamId: payload.streamId,
      isActive: false,
      disconnectedAt: new Date().toISOString(),
    };
  }
}
