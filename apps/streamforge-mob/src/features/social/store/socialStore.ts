import { useState } from "react";

export function useSocialStore() {
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  return { selectedCreator, setSelectedCreator };
}
