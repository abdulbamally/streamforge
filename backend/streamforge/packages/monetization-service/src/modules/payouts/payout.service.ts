export class PayoutService {
  async requestPayout(payload: { userId: string; amount: number }) {
    return {
      id: 'payout-id',
      userId: payload.userId,
      amount: payload.amount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
  }

  async getPayouts(userId: string) {
    return [
      {
        id: 'payout-id',
        userId,
        amount: 50,
        status: 'completed',
        requestedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      },
    ];
  }
}
