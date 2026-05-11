export class WalletService {
  async getWallet(userId: string) {
    return {
      userId,
      balance: 0,
      currency: 'USD',
    };
  }

  async topUp(userId: string, amount: number) {
    return {
      userId,
      balance: amount,
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    };
  }
}
