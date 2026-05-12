import { WalletTxType } from "@streamforge/auth-service/prisma";
import { prisma } from "../../utils/prisma";

export class GiftService {
  async sendGift(payload: {
    senderId: string;
    receiverId: string;
    streamId?: string | null;
    coinAmount: number;
    giftType: string;
  }) {
    const { senderId, receiverId, streamId, coinAmount, giftType } = payload;
    if (senderId === receiverId) {
      const err = new Error("Cannot gift yourself");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }
    if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
      const err = new Error("coinAmount must be a positive integer");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const senderWallet = await tx.creatorWallet.upsert({
        where: { userId: senderId },
        create: { userId: senderId, balanceCents: 0 },
        update: {},
      });
      if (senderWallet.balanceCents < coinAmount) {
        const err = new Error("Insufficient balance");
        (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 402;
        throw err;
      }

      const receiverWallet = await tx.creatorWallet.upsert({
        where: { userId: receiverId },
        create: { userId: receiverId, balanceCents: 0 },
        update: {},
      });

      const senderBalance = senderWallet.balanceCents - coinAmount;
      const receiverBalance = receiverWallet.balanceCents + coinAmount;

      await tx.creatorWallet.update({
        where: { id: senderWallet.id },
        data: { balanceCents: senderBalance },
      });
      await tx.creatorWallet.update({
        where: { id: receiverWallet.id },
        data: { balanceCents: receiverBalance },
      });

      const gift = await tx.creatorGift.create({
        data: {
          streamId: streamId ?? null,
          senderId,
          receiverId,
          coinAmount,
          giftType,
        },
      });

      await tx.walletLedgerEntry.create({
        data: {
          walletId: senderWallet.id,
          type: WalletTxType.GIFT_SENT,
          amountCents: -coinAmount,
          balanceAfter: senderBalance,
          metadata: { giftId: gift.id, receiverId },
        },
      });
      await tx.walletLedgerEntry.create({
        data: {
          walletId: receiverWallet.id,
          type: WalletTxType.GIFT_RECEIVED,
          amountCents: coinAmount,
          balanceAfter: receiverBalance,
          metadata: { giftId: gift.id, senderId },
        },
      });

      return {
        id: gift.id,
        streamId: gift.streamId,
        senderId: gift.senderId,
        receiverId: gift.receiverId,
        coinAmount: gift.coinAmount,
        type: gift.giftType,
        createdAt: gift.createdAt.toISOString(),
      };
    });
  }

  async getReceivedGifts(receiverId: string) {
    const rows = await prisma.creatorGift.findMany({
      where: { receiverId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map((g) => ({
      id: g.id,
      streamId: g.streamId,
      senderId: g.senderId,
      receiverId: g.receiverId,
      coinAmount: g.coinAmount,
      type: g.giftType,
      createdAt: g.createdAt.toISOString(),
    }));
  }
}
