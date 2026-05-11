export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  message: string;
  createdAt: string;
}

export interface PresenceSession {
  id: string;
  userId: string;
  streamId: string;
  isActive: boolean;
  connectedAt: string;
}
