import { useState } from 'react';

export function useCommunityStore() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  return { activeTopic, setActiveTopic };
}
