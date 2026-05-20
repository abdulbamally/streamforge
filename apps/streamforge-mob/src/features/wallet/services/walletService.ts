export const walletService = {
  getBalance: async () => ({ balance: 0.0, currency: 'USD' }),
  requestPayout: async (amount: number) => ({ success: true, amount }),
};
