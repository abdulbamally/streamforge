export interface WalletBalance {
  userId: string;
  balance: number;
  currency: string;
}

export interface GiftRecord {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  type: string;
  createdAt: string;
}

export interface PayoutRecord {
  id: string;
  userId: string;
  amount: number;
  status: string;
  requestedAt: string;
  processedAt?: string;
}
