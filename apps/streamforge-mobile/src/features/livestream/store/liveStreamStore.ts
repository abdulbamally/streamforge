import { useState } from "react";

export function useLiveStreamStore() {
  const [isStreaming, setIsStreaming] = useState(false);
  return { isStreaming, setIsStreaming };
}
