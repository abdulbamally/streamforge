export class MonetizationService {
  getHealth() {
    return { status: "ok", features: ["wallet", "gifts", "payouts"] };
  }
}
