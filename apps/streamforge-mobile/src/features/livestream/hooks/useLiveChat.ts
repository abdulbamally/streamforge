import { useCallback, useEffect, useRef, useState } from "react";
import { connectLiveRoomWs, realtimeApi } from "@streamforge/api-contract";
import { useTokenStore } from "../../../core/store/tokenStore";
import type { LiveChatMessage } from "../types/livestream";

export function useLiveChat(streamId?: string) {
  const accessToken = useTokenStore((s) => s.accessToken);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const wsRef = useRef<ReturnType<typeof connectLiveRoomWs> | null>(null);

  useEffect(() => {
    if (!streamId) {
      setMessages([
        {
          id: "hint",
          user: "StreamForge",
          text: "Open a stream with a valid stream id to load chat history and live messages.",
        },
      ]);
      return;
    }

    const activeStreamId = streamId
    let cancelled = false;

    async function loadHistory() {
      try {
        const rows = await realtimeApi.listChatMessages(activeStreamId);
        if (cancelled) return;
        setMessages(
          rows.map((r) => ({
            id: r.id,
            user: r.userId,
            text: r.message,
          })),
        );
      } catch {
        if (!cancelled) {
          setMessages([]);
        }
      }
    }

    void loadHistory();

    if (!accessToken) {
      return () => {
        cancelled = true;
      };
    }

    const ws = connectLiveRoomWs({
      autoJoinStreamId: streamId,
      onChatReceive: (p) => {
        setMessages((prev) => [
          ...prev,
          { id: p.id, user: p.username, text: p.text },
        ]);
      },
      onError: () => {
        /* non-fatal; history still visible */
      },
    });
    wsRef.current = ws;

    return () => {
      cancelled = true;
      ws.close();
      wsRef.current = null;
    };
  }, [streamId, accessToken]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!streamId || !text.trim()) return;
      wsRef.current?.sendChat(streamId, text.trim());
    },
    [streamId],
  );

  const sendReaction = useCallback(
    (reaction: string) => {
      if (!streamId || !reaction.trim()) return;
      wsRef.current?.sendReaction(streamId, reaction.trim());
    },
    [streamId],
  );

  return { messages, sendMessage, sendReaction };
}
