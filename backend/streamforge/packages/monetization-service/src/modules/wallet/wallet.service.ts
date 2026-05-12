import { WalletTxType } from "@streamforge/auth-service/prisma";
import { prisma } from "../../utils/prisma";

const MAX_TOP_UP_CENTS = 100_000;

export class WalletService {
  async getWallet(userId: string) {
    const w = await prisma.creatorWallet.upsert({
      where: { userId },
      create: { userId, balanceCents: 0 },
      update: {},
    });
    return {
      userId: w.userId,
      balanceCents: w.balanceCents,
      currency: "USD",
      updatedAt: w.updatedAt.toISOString(),
    };
  }

  async topUp(userId: string, amountCents: number) {
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      const err = new Error("Amount must be a positive integer (cents)");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }
    if (amountCents > MAX_TOP_UP_CENTS) {
      const err = new Error(`Top-up cannot exceed ${MAX_TOP_UP_CENTS} cents per request`);
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.creatorWallet.upsert({
        where: { userId },
        create: { userId, balanceCents: 0 },
        update: {},
      });
      const newBalance = wallet.balanceCents + amountCents;
      await tx.creatorWallet.update({
        where: { id: wallet.id },
        data: { balanceCents: newBalance },
      });
      await tx.walletLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: WalletTxType.TOP_UP,
          amountCents,
          balanceAfter: newBalance,
          metadata: { source: "api_top_up" },
        },
      });
      return {
        userId,
        balanceCents: newBalance,
        currency: "USD",
        updatedAt: new Date().toISOString(),
      };
    });
  }
}
