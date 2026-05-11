export class ChatService {
  async createMessage(payload: {
    roomId: string;
    userId: string;
    message: string;
  }) {
    return {
      id: "sample-message-id",
      roomId: payload.roomId,
      userId: payload.userId,
      message: payload.message,
      createdAt: new Date().toISOString(),
    };
  }

  async getRoomMessages(roomId: string) {
    return [
      {
        id: "sample-message-id",
        roomId,
        userId: "user-123",
        message: "Welcome to the chat room",
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
