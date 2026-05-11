export class RealtimeService {
  getHealth() {
    return { status: "ok", metrics: ["chat", "presence", "socket"] };
  }
}
