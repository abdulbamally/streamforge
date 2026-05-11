import { useEffect, useState } from "react";
import { LiveChatMessage } from "../types/livestream";

export function useLiveChat() {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);

  useEffect(() => {
    setMessages([{ id: "1", user: "Host", text: "Welcome to the stream!" }]);
  }, []);

  return { messages };
}
