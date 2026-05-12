import { prisma } from "../../utils/prisma";

/**
 * Payout requests are recorded for operator review. Balance is not debited here;
 * settlement should run via a trusted worker once payouts are approved (Phase 3+).
 */
export class PayoutService {
  async requestPayout(userId: string, amountCents: number) {
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      const err = new Error("Amount must be a positive integer (cents)");
      (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode = 400;
      throw err;
    }

    const row = await prisma.payoutRequest.create({
      data: {
        userId,
        amountCents,
        status: "PENDING",
      },
    });

    return {
      id: row.id,
      userId: row.userId,
      amountCents: row.amountCents,
      status: row.status,
      requestedAt: row.requestedAt.toISOString(),
      processedAt: row.processedAt?.toISOString() ?? null,
    };
  }

  async getPayouts(userId: string) {
    const rows = await prisma.payoutRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: "desc" },
      take: 50,
    });
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      amountCents: row.amountCents,
      status: row.status,
      requestedAt: row.requestedAt.toISOString(),
      processedAt: row.processedAt?.toISOString() ?? null,
    }));
  }
}
