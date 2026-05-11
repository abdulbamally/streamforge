export class GiftService {
  async sendGift(payload: { senderId: string; receiverId: string; amount: number; type: string }) {
    return {
      id: 'gift-id',
      ...payload,
      createdAt: new Date().toISOString(),
    };
  }

  async getReceivedGifts(receiverId: string) {
    return [
      {
        id: 'gift-id',
        senderId: 'user-sender',
        receiverId,
        amount: 10,
        type: 'heart',
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
