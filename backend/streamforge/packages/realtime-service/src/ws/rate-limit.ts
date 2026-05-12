const WINDOW_MS = 5_000;
const MAX_MSG = 25;

const chatBuckets = new Map<string, { n: number; resetAt: number }>();

export function allowChatMessage(key: string): boolean {
  const now = Date.now();
  const cur = chatBuckets.get(key);
  if (!cur || now > cur.resetAt) {
    chatBuckets.set(key, { n: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (cur.n >= MAX_MSG) {
    return false;
  }
  cur.n += 1;
  return true;
}
